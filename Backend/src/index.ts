import "dotenv/config";
import express, { Request, Response } from "express";
import multer from "multer";
import { getGeminiResponse } from "./services/gemini";
import { speechToText, textToSpeech } from "./services/sarvam";
import { AnaajRequest, ImageMimeType } from "./types";

type UploadedFiles = {
  audio?: Express.Multer.File[];
  image?: Express.Multer.File[];
};

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

const SUPPORTED_IMAGE_MIME_TYPES: ImageMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

app.post(
  "/chat",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as UploadedFiles | undefined;
      const audioFile = files?.audio?.[0];
      const imageFile = files?.image?.[0];
      const userId =
        typeof req.body.userId === "string" ? req.body.userId.trim() : "";
      const languageCode =
        typeof req.body.languageCode === "string" && req.body.languageCode.trim()
          ? req.body.languageCode.trim()
          : "hi-IN";
      const bodyMessage =
        typeof req.body.message === "string" ? req.body.message.trim() : "";

      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      let isVoiceInput = false;
      let transcribedText: string | undefined;
      let userMessage = bodyMessage;

      if (audioFile) {
        transcribedText = await speechToText(audioFile.buffer, languageCode);
        userMessage = transcribedText;
        isVoiceInput = true;
      }

      if (!audioFile && !userMessage) {
        return res.status(400).json({ error: "message or audio required" });
      }

      if (!userMessage) {
        return res.status(400).json({ error: "Unable to determine user message" });
      }

      let imageBase64: string | undefined;
      let imageMimeType: ImageMimeType | undefined;

      if (imageFile) {
        if (!SUPPORTED_IMAGE_MIME_TYPES.includes(imageFile.mimetype as ImageMimeType)) {
          return res.status(400).json({ error: "unsupported image type" });
        }

        imageBase64 = imageFile.buffer.toString("base64");
        imageMimeType = imageFile.mimetype as ImageMimeType;
      }

      const anaajRequest: AnaajRequest = {
        userId,
        message: userMessage,
        imageBase64,
        imageMimeType,
        audioBuffer: audioFile?.buffer,
        languageCode,
        isVoiceInput,
      };

      const geminiResponse = await getGeminiResponse(anaajRequest);

      let audioBase64: string | undefined;
      if (isVoiceInput) {
        audioBase64 = await textToSpeech(geminiResponse.text, languageCode);
      }

      return res.json({
        reply: geminiResponse.text,
        modelUsed: geminiResponse.modelUsed,
        queryType: geminiResponse.queryType,
        transcribedText,
        audioBase64,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      return res.status(500).json({ error: message });
    }
  }
);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Anaaj AI running on port ${port}`);
});
