import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { convertSpeechToText } from '../services/sarvamSTT';
import { retrieveContext } from '../database/vectorStore';
import { getCropAdvisory } from '../services/ragService';
import { askLLM } from '../services/llmRouter';
import { convertTextToSpeech } from '../services/sarvamTTS';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Audio file is required' });
            return;
        }

        const model = req.body.model || 'gemini';

        // 1. Speech to Text via Sarvam Saaras v3
        const transcription = await convertSpeechToText(req.file.path);
        const { text: question, language } = transcription;

        if (!question) {
            res.status(400).json({ error: 'Could not transcribe audio' });
            return;
        }

        // Clean up the uploaded file after transcription
        fs.unlinkSync(req.file.path);

        // 2. Vector Search for RAG
        const context = await retrieveContext(question);

        // 3. Crop DB Lookups
        const cropData = await getCropAdvisory(question);

        // 4. LLM Reasoning
        // Append an explicit command for the voice answer to fit Sarvam's constraints (it throws 400 on 500+ length inputs array chunks)
        const voiceQuestion = `${question} (IMPORTANT: Give a VERY short response under 450 characters. Get straight to the point without pleasantries as this is a voice response.)`;
        const answer = await askLLM(voiceQuestion, context, cropData, language, model);

        // 5. Text to Speech via Sarvam Bulbul v3
        let audioBase64 = '';
        try {
            audioBase64 = await convertTextToSpeech(answer, language);
        } catch (ttsError) {
            console.error("TTS conversion skipped due to error:", ttsError);
        }

        res.json({
            question,
            detectedLanguage: language,
            answer,
            audio: audioBase64
        });

    } catch (error) {
        console.error("Voice Route Error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
