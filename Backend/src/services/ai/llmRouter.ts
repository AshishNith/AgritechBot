import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import {
  assertNotRefused,
  createMessage,
  classifyClaudeError,
  CLAUDE_MODEL,
  getResponseText,
  getRetryAfterSeconds,
} from './claudeClient';

let rateLimitedUntil = 0;

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

// Crop plans and 15-20 task schedules are long JSON answers; keep this under the
// mobile app's 90s request timeout.
const LLM_TIMEOUT_MS = 75_000;

/**
 * Sends messages to Claude and returns the text response.
 * Messages with role "system" are joined into the system prompt.
 */
export async function queryLLM(
  messages: Array<{ role: string; content: string }>
): Promise<LLMResponse> {
  if (Date.now() < rateLimitedUntil) {
    throw new Error('LLM provider temporarily unavailable due to rate limit cooldown');
  }

  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const conversation: Anthropic.MessageParam[] = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));

  if (conversation.length === 0) throw new Error('No user message found');

  try {
    const response = await createMessage(
      {
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        output_config: { effort: 'low' },
        ...(system ? { system } : {}),
        messages: conversation,
      },
      { timeout: LLM_TIMEOUT_MS }
    );

    assertNotRefused(response);
    const content = getResponseText(response);
    if (!content) throw new Error('Empty response from Claude');

    rateLimitedUntil = 0;
    return {
      content,
      model: CLAUDE_MODEL,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (err) {
    if (classifyClaudeError(err) === 'rate_limited') {
      const retryAfterSeconds = getRetryAfterSeconds(err, 30);
      rateLimitedUntil = Date.now() + retryAfterSeconds * 1000;
      logger.warn({ retryAfterSeconds }, 'Claude rate limit hit; enabling temporary cooldown');
      throw new Error(`LLM provider rate limited: ${String((err as Error)?.message ?? err)}`);
    }

    logger.error({ err }, 'Claude LLM request failed');
    throw new Error(`LLM provider failed: ${String((err as Error)?.message ?? err)}`);
  }
}
