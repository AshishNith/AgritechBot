/**
 * claudeClient.ts — shared Anthropic (Claude) client and helpers.
 *
 * Every AI feature in the backend (chat, voice answers, crop scan, crop planner,
 * task scheduling, suggestions, history summaries) goes through this module so the
 * model, key, timeouts and error handling live in one place.
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';

export const claude = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  maxRetries: 1,
  timeout: 60_000,
});

const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/**
 * Creates a message with server-side refusal fallback enabled ("default" mode): if
 * the model declines a request for policy reasons, the API retries it on a fallback
 * model inside the same call instead of returning a refusal to the farmer.
 */
export async function createMessage(
  params: Anthropic.MessageCreateParamsNonStreaming,
  options?: Anthropic.RequestOptions
): Promise<Anthropic.Message> {
  const response = await claude.beta.messages.create(
    {
      ...(params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming),
      betas: [FALLBACK_BETA],
      fallbacks: 'default',
    },
    options
  );
  return response as unknown as Anthropic.Message;
}

/** Main model for farmer-facing answers. */
export const CLAUDE_MODEL = env.ANTHROPIC_MODEL;

/** Model for small background jobs; falls back to the main model. */
export const CLAUDE_SUGGESTIONS_MODEL = env.ANTHROPIC_SUGGESTIONS_MODEL || env.ANTHROPIC_MODEL;

export type ClaudeImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const SUPPORTED_IMAGE_TYPES: Record<string, ClaudeImageMediaType> = {
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/png': 'image/png',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
};

/** Maps a MIME type to one Claude accepts, or undefined (e.g. image/bmp is not supported). */
export function toClaudeImageMediaType(mimeType?: string): ClaudeImageMediaType | undefined {
  if (!mimeType) return 'image/jpeg';
  return SUPPORTED_IMAGE_TYPES[mimeType.toLowerCase()];
}

/** Joins the text blocks of a Claude response. */
export function getResponseText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

/**
 * Parses JSON out of model text. Tolerates ```json fences and stray text around the
 * JSON value, so a sentence before or after the JSON does not break the feature.
 */
export function parseJsonFromModel<T = unknown>(text: string): T {
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstObject = cleaned.indexOf('{');
    const firstArray = cleaned.indexOf('[');
    const starts = [firstObject, firstArray].filter((i) => i !== -1);
    if (starts.length === 0) throw new Error('No JSON found in model response');
    const start = Math.min(...starts);
    const end = cleaned[start] === '[' ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
    if (end <= start) throw new Error('Incomplete JSON in model response');
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}

export type ClaudeErrorKind = 'rate_limited' | 'unavailable' | 'timeout' | 'other';

/** Classifies an error thrown by the Anthropic SDK. */
export function classifyClaudeError(error: unknown): ClaudeErrorKind {
  if (error instanceof Anthropic.RateLimitError) return 'rate_limited';
  if (error instanceof Anthropic.APIConnectionTimeoutError) return 'timeout';
  if (error instanceof Anthropic.APIConnectionError) return 'unavailable';
  if (error instanceof Anthropic.APIError && typeof error.status === 'number' && error.status >= 500) {
    return 'unavailable'; // includes 529 overloaded
  }
  if (error instanceof Error && /timed out/i.test(error.message)) return 'timeout';
  return 'other';
}

/** Seconds to wait before retrying, from the retry-after header when present. */
export function getRetryAfterSeconds(error: unknown, fallbackSeconds = 10): number {
  if (error instanceof Anthropic.APIError) {
    const header = error.headers?.get?.('retry-after');
    const seconds = header ? Number(header) : NaN;
    if (Number.isFinite(seconds) && seconds > 0) return Math.min(Math.ceil(seconds), 60);
  }
  return fallbackSeconds;
}

/** Thrown when Claude declines a request (stop_reason "refusal"). */
export class ClaudeRefusalError extends Error {
  constructor(message = 'The AI declined to answer this request') {
    super(message);
    this.name = 'ClaudeRefusalError';
  }
}

/** Throws ClaudeRefusalError when the response was a refusal. */
export function assertNotRefused(message: Anthropic.Message): void {
  if (message.stop_reason === 'refusal') {
    throw new ClaudeRefusalError();
  }
}
