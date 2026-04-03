import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getLanguageCode } from '../../utils/languageDetector';
import { HttpError } from '../../chat/utils/httpError';

interface STTResponse {
  text: string;
  language: string;
}

interface SarvamErrorBody {
  error?: {
    message?: string;
  };
}

function fileExtensionForMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes('wav')) return 'wav';
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
  if (normalized.includes('webm')) return 'webm';
  if (normalized.includes('ogg')) return 'ogg';
  if (normalized.includes('aac')) return 'aac';
  if (normalized.includes('mp4') || normalized.includes('m4a')) return 'm4a';

  return 'bin';
}

/**
 * Convert audio to text using Sarvam AI Speech-to-Text.
 * Accepts a base64-encoded audio buffer. Sends as multipart/form-data.
 */
export async function speechToText(
  audioBase64: string,
  language?: string,
  mimeType: string = 'audio/mp4',
  fileName?: string
): Promise<STTResponse> {
  try {
    const langCode = language ? getLanguageCode(language) : 'hi-IN';

    // Sarvam STT expects multipart/form-data with the audio file
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    let normalizedMimeType = mimeType || 'audio/mp4';
    if (normalizedMimeType === 'audio/m4a') {
      normalizedMimeType = 'audio/mp4';
    }
    
    const audioBlob = new Blob([audioBuffer], { type: normalizedMimeType });
    const uploadFileName =
      fileName && fileName.trim().length > 0
        ? fileName
        : `audio.${fileExtensionForMimeType(normalizedMimeType)}`;

    const form = new FormData();
    form.append('file', audioBlob, uploadFileName);
    form.append('language_code', langCode);
    form.append('model', env.SARVAM_STT_MODEL);
    form.append('with_timestamps', 'false');

    logger.debug({ url: env.SARVAM_STT_URL, model: env.SARVAM_STT_MODEL, langCode }, 'Calling Sarvam STT API');

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
      logger.error({ status: response.status, errBody }, 'Sarvam STT Provider Error');
      let providerMessage = `Sarvam STT error (${response.status})`;

      try {
        const parsed = JSON.parse(errBody) as SarvamErrorBody;
        if (parsed.error?.message) {
          providerMessage = parsed.error.message;
        }
      } catch {
        if (errBody.trim()) {
          providerMessage = errBody.trim();
        }
      }

      if (response.status >= 400 && response.status < 500) {
        if (/audio duration is 0/i.test(providerMessage)) {
          throw new HttpError('Recording is too short. Please speak for a moment and try again.', 400);
        }

        throw new HttpError(providerMessage, 400);
      }

      throw new HttpError('Speech transcription provider is temporarily unavailable. Please try again.', 502);
    }

    const data = (await response.json()) as { transcript?: string; text?: string };
    
    logger.info({ 
      transcriptLength: (data.transcript || data.text || '').length,
      hasTranscript: !!(data.transcript || data.text)
    }, 'Sarvam STT success');

    return {
      text: data.transcript || data.text || '',
      language: language || 'Hindi',
    };
  } catch (err: any) {
    logger.error({ err: err.message, stack: err.stack }, 'Sarvam STT failed');
    throw err;
  }
}
