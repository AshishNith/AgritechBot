import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { getSystemPrompt } from "../config/prompts";
import { classifyQuery } from "./router";
import { AnaajRequest, AnaajResponse, ModelTier, QueryType } from "../types";

const FLASH_LITE: ModelTier =
  (process.env.GEMINI_TEXT_MODEL as ModelTier | undefined) ?? "gemini-2.5-flash-lite";
const FLASH: ModelTier =
  (process.env.GEMINI_IMAGE_MODEL as ModelTier | undefined) ?? "gemini-2.5-flash";

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateText(
  modelName: ModelTier,
  userId: string,
  parts: Part[]
): Promise<string> {
  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: getSystemPrompt(userId),
  });

  const result = await model.generateContent(parts);
  return result.response.text().trim();
}

export async function getGeminiResponse(req: AnaajRequest): Promise<AnaajResponse> {
  const hasImage = Boolean(req.imageBase64 && req.imageMimeType);
  const queryType: QueryType = classifyQuery(req.message, hasImage);
  const selectedModel: ModelTier = hasImage ? FLASH : FLASH_LITE;

  const parts: Part[] = [{ text: req.message }];

  if (req.imageBase64 && req.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: req.imageMimeType,
        data: req.imageBase64,
      },
    });
  }

  const text = await generateText(selectedModel, req.userId, parts);

  return {
    text,
    modelUsed: selectedModel,
    queryType,
  };
}
