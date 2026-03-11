import { Router, Request, Response } from 'express';
import { retrieveContext } from '../database/vectorStore';
import { getCropAdvisory } from '../services/ragService';
import { askLLM } from '../services/llmRouter';
import { convertTextToSpeech } from '../services/sarvamTTS';
import { detectLanguage } from '../services/languageDetector';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { question, language, model = 'gemini' } = req.body;

        if (!question) {
            res.status(400).json({ error: 'Question is required' });
            return;
        }

        const detectedLang = language || detectLanguage(question);

        // 1. Vector Search for RAG
        const context = await retrieveContext(question);

        // 2. Crop DB Lookups
        const cropData = await getCropAdvisory(question);

        // 3. LLM Reasoning
        const answer = await askLLM(question, context, cropData, detectedLang, model);

        // 4. Text to Speech
        let audioBase64 = '';
        try {
            audioBase64 = await convertTextToSpeech(answer, detectedLang);
        } catch (ttsError) {
            console.error("TTS conversion skipped due to error:", ttsError);
        }

        res.json({
            question,
            language: detectedLang,
            answer,
            audio: audioBase64
        });

    } catch (error) {
        console.error("Ask Route Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
