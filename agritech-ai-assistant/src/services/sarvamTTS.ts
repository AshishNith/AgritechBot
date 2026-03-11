import axios from 'axios';

export async function convertTextToSpeech(text: string, language: string): Promise<string> {
    try {
        // Map common names to Sarvam target languages e.g., 'hi-IN', 'pa-IN', 'gu-IN'
        const langMap: Record<string, string> = {
            'Hindi': 'hi-IN',
            'Punjabi': 'pa-IN',
            'Gujarati': 'gu-IN'
        };

        const targetLanguageCode = langMap[language] || 'hi-IN';

        // Sarvam TTS throws a hard 400 Validation Error if any single input string > 500 chars.
        // We instruct the LLM to output < 450 chars, but as a hard failsafe for audio, we cap the string.
        const safeText = text.length > 490 ? text.substring(0, 490) + '...' : text;

        const payload = {
            inputs: [safeText],
            target_language_code: targetLanguageCode,
            model: 'bulbul:v3'
        };

        const response = await axios.post(
            'https://api.sarvam.ai/text-to-speech',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': process.env.SARVAM_API_KEY || '',
                },
            }
        );

        // Sarvam usually returns the base64 encoded audio in audios[0]
        if (response.data && response.data.audios && response.data.audios.length > 0) {
            return response.data.audios[0];
        }

        throw new Error('No audio returned from Sarvam API');
    } catch (error: any) {
        if (error.response && error.response.data) {
            console.error("Sarvam TTS Validation Error details:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Sarvam TTS Error:", error.message || error);
        }
        throw new Error('Text to speech conversion failed');
    }
}
