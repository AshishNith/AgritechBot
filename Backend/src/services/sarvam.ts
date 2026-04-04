import axios from "axios";
import FormData from "form-data";

interface SarvamSpeechToTextResponse {
  transcript: string;
}

interface SarvamTextToSpeechResponse {
  audios: string[];
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function speechToText(
  audioBuffer: Buffer,
  languageCode: string = "hi-IN"
): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", audioBuffer, {
      filename: "audio.wav",
      contentType: "audio/wav",
    });
    form.append("language_code", languageCode);
    form.append("model", "saarika:v2");

    const response = await axios.post<SarvamSpeechToTextResponse>(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "API-Subscription-Key": process.env.SARVAM_API_KEY!,
        },
        timeout: 60_000,
      }
    );

    return response.data.transcript;
  } catch (error) {
    console.error("Sarvam speech-to-text failed", error);
    throw new Error(`Failed to transcribe audio with Sarvam: ${getErrorMessage(error)}`);
  }
}

export async function textToSpeech(
  text: string,
  languageCode: string = "hi-IN"
): Promise<string> {
  try {
    const response = await axios.post<SarvamTextToSpeechResponse>(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],
        target_language_code: languageCode,
        speaker: "meera",
        model: "bulbul:v1",
      },
      {
        headers: {
          "API-Subscription-Key": process.env.SARVAM_API_KEY!,
          "Content-Type": "application/json",
        },
        timeout: 60_000,
      }
    );

    return response.data.audios[0];
  } catch (error) {
    console.error("Sarvam text-to-speech failed", error);
    throw new Error(`Failed to synthesize speech with Sarvam: ${getErrorMessage(error)}`);
  }
}
