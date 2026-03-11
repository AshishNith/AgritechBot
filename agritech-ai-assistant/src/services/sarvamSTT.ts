import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export async function convertSpeechToText(audioFilePath: string): Promise<{ text: string, language: string }> {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        // As per Saaras v3 docs (model="saaras:v3" or default)
        formData.append('model', 'saaras:v3');

        const response = await axios.post(
            'https://api.sarvam.ai/speech-to-text',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'api-subscription-key': process.env.SARVAM_API_KEY || '',
                },
            }
        );

        // Assume response gives transcript and optionally detected language
        return {
            text: response.data.transcript || '',
            language: response.data.language_code || 'hi-IN'
        };
    } catch (error) {
        console.error("Sarvam STT Error:", error);
        throw new Error('Speech to text conversion failed');
    }
}
