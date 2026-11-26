import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "../config/prompts";
import { classifyQuery } from "./router";
import { AnaajRequest, AnaajResponse, QueryType } from "../types";
import {
  assertNotRefused,
  createMessage,
  CLAUDE_MODEL,
  getResponseText,
} from "./ai/claudeClient";

/** Legacy Express /chat endpoint (src/index.ts), now answered by Claude. */
export async function getClaudeResponse(req: AnaajRequest): Promise<AnaajResponse> {
  const hasImage = Boolean(req.imageBase64 && req.imageMimeType);
  const queryType: QueryType = classifyQuery(req.message, hasImage);

  const content: Anthropic.ContentBlockParam[] = [];
  if (req.imageBase64 && req.imageMimeType) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: req.imageMimeType, data: req.imageBase64 },
    });
  }
  content.push({ type: "text", text: req.message });

  const response = await createMessage({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    output_config: { effort: "low" },
    system: getSystemPrompt(req.userId),
    messages: [{ role: "user", content }],
  });

  assertNotRefused(response);

  return {
    text: getResponseText(response),
    modelUsed: CLAUDE_MODEL,
    queryType,
  };
}
