import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getLanguageCode } from '../../utils/languageDetector';

/**
 * Convert text to speech using Sarvam AI TTS.
 * Returns base64 audio.
 */
export async function textToSpeech(
  text: string,
  language: string = 'Hindi'
): Promise<string> {
  try {
    const langCode = getLanguageCode(language);

    const response = await fetch(env.SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [text.substring(0, 2000)], // Sarvam TTS expects an array of strings
        target_language_code: langCode,
        speaker: 'meera',
        model: 'bulbul:v1',
        enable_preprocessing: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Sarvam TTS error (${response.status}): ${errBody}`);
    }

    const data = (await response.json()) as { audio?: string; audios?: string[] };
    return data.audio || data.audios?.[0] || '';
  } catch (err) {
    logger.error({ err }, 'Sarvam TTS failed');
    throw err;
  }
}
