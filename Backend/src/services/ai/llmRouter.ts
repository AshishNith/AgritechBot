import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
let quotaBlockedUntil = 0;

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

const LLM_TIMEOUT_MS = 30_000;

function isQuotaError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as { status?: number }).status;
  const msg = (err as { message?: string }).message || '';
  return status === 429 || msg.includes('429 Too Many Requests') || msg.includes('Quota exceeded');
}

function parseRetryDelayMs(err: unknown): number {
  if (typeof err !== 'object' || err === null) return 60_000;

  const details = (err as { errorDetails?: Array<Record<string, unknown>> }).errorDetails;
  if (Array.isArray(details)) {
    const retryInfo = details.find((d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
    const delay = retryInfo?.retryDelay;
    if (typeof delay === 'string' && delay.endsWith('s')) {
      const seconds = Number.parseFloat(delay.slice(0, -1));
      if (!Number.isNaN(seconds) && seconds > 0) {
        return Math.ceil(seconds * 1000);
      }
    }
  }

  const msg = (err as { message?: string }).message || '';
  const regexMatch = msg.match(/retry in\s+([\d.]+)s/i);
  if (regexMatch?.[1]) {
    const seconds = Number.parseFloat(regexMatch[1]);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000);
    }
  }

  return 60_000;
}

/**
 * Sends messages to Gemini and returns the LLM response.
 */
export async function queryLLM(
  messages: Array<{ role: string; content: string }>
): Promise<LLMResponse> {
  if (Date.now() < quotaBlockedUntil) {
    throw new Error('LLM provider temporarily unavailable due to quota cooldown');
  }

  try {
    const result = await queryGemini(messages);
    quotaBlockedUntil = 0;
    return result;
  } catch (err) {
    if (isQuotaError(err)) {
      const retryDelayMs = parseRetryDelayMs(err);
      quotaBlockedUntil = Date.now() + retryDelayMs;
      logger.warn(
        { retryDelayMs, retryAt: new Date(quotaBlockedUntil).toISOString() },
        'Gemini quota exceeded; enabling temporary cooldown'
      );
      throw new Error(`LLM provider quota exceeded: ${String((err as Error)?.message ?? err)}`);
    }

    logger.error({ err }, 'Gemini LLM request failed');
    throw new Error(`LLM provider failed: ${String((err as Error)?.message ?? err)}`);
  }
}

async function queryGemini(
  messages: Array<{ role: string; content: string }>
): Promise<LLMResponse> {
  // systemInstruction must be passed to getGenerativeModel, not to startChat
  const systemText = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const model = gemini.getGenerativeModel({
    model: env.GEMINI_MODEL,
    ...(systemText ? { systemInstruction: systemText } : {}),
  });

  const chatHistory = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));

  // Pop last user message to use as the sendMessage input
  const lastMessage = chatHistory.pop();
  if (!lastMessage) throw new Error('No user message found');

  const chat = model.startChat({ history: chatHistory });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const content = result.response.text();
    if (!content) throw new Error('Empty response from Gemini');

    return {
      content,
      model: env.GEMINI_MODEL,
    };
  } finally {
    clearTimeout(timeout);
  }
}
