import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getLanguageCode } from '../../utils/languageDetector';

const SARVAM_TTS_MAX_CHARS = 500;

function trimForSarvamTTS(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= SARVAM_TTS_MAX_CHARS) {
    return normalized;
  }

  const clipped = normalized.slice(0, SARVAM_TTS_MAX_CHARS);
  const sentenceBoundary = Math.max(
    clipped.lastIndexOf('.'),
    clipped.lastIndexOf('!'),
    clipped.lastIndexOf('?'),
    clipped.lastIndexOf('।')
  );

  if (sentenceBoundary >= 200) {
    return clipped.slice(0, sentenceBoundary + 1).trim();
  }

  const wordBoundary = clipped.lastIndexOf(' ');
  if (wordBoundary >= 200) {
    return clipped.slice(0, wordBoundary).trim();
  }

  return clipped.trim();
}

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
    const ttsInput = trimForSarvamTTS(text);

    if (!ttsInput) {
      return '';
    }

    const response = await fetch(env.SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [ttsInput],
        target_language_code: langCode,
        speaker: env.SARVAM_TTS_SPEAKER,
        model: env.SARVAM_TTS_MODEL,
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
