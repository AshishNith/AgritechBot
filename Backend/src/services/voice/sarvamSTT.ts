import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getLanguageCode } from '../../utils/languageDetector';

interface STTResponse {
  text: string;
  language: string;
}

/**
 * Convert audio to text using Sarvam AI Speech-to-Text.
 * Accepts a base64-encoded audio buffer. Sends as multipart/form-data.
 */
export async function speechToText(
  audioBase64: string,
  language?: string
): Promise<STTResponse> {
  try {
    const langCode = language ? getLanguageCode(language) : 'hi-IN';

    // Sarvam STT expects multipart/form-data with the audio file
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    const form = new FormData();
    form.append('file', audioBlob, 'audio.wav');
    form.append('language_code', langCode);
    form.append('model', 'saarika:v2');
    form.append('with_timestamps', 'false');

    const response = await fetch(env.SARVAM_STT_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': env.SARVAM_API_KEY,
        // Do NOT set Content-Type — fetch sets it automatically with the multipart boundary
      },
      body: form,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Sarvam STT error (${response.status}): ${errBody}`);
    }

    const data = (await response.json()) as { transcript?: string; text?: string };

    return {
      text: data.transcript || data.text || '',
      language: language || 'Hindi',
    };
  } catch (err) {
    logger.error({ err }, 'Sarvam STT failed');
    throw err;
  }
}
