/**
 * Token estimation utilities.
 *
 * Used to keep the chat history inside a token budget before calling Claude.
 *
 * Estimation approach:
 * - For English text: ~4 characters per token (common approximation)
 * - For multilingual text (Hindi, Gujarati, Punjabi): ~2-3 chars per token
 */

const CHARS_PER_TOKEN_EN = 4;
const CHARS_PER_TOKEN_MULTILINGUAL = 2.5;

/** A text-only chat turn as stored in the database. */
export interface HistoryTurn {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Token estimation that considers language composition.
 */
export function estimateTextTokens(text: string): number {
  if (!text) {
    return 0;
  }

  // Detect if text contains non-ASCII characters (indicates multilingual content)
  const hasNonAscii = /[^\x00-\x7F]/.test(text);
  const charsPerToken = hasNonAscii ? CHARS_PER_TOKEN_MULTILINGUAL : CHARS_PER_TOKEN_EN;

  // Average a character-based and a word-based estimate
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charBasedEstimate = Math.ceil(text.length / charsPerToken);
  const wordBasedEstimate = Math.ceil(wordCount * 1.3);

  return Math.ceil((charBasedEstimate + wordBasedEstimate) / 2);
}

/**
 * Estimates tokens in a chat history.
 */
export function estimateContentTokens(turns: HistoryTurn[]): number {
  return turns.reduce((total, turn) => total + estimateTextTokens(turn.text), 0);
}
