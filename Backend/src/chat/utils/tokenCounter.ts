import type { Content } from '@google/generative-ai';

/**
 * Token estimation utilities.
 * 
 * Note: The Gemini API returns accurate token counts in usageMetadata.
 * These estimates are used as fallbacks when the API response doesn't include usage data.
 * 
 * Estimation approach:
 * - For English text: ~4 characters per token (common approximation)
 * - For multilingual text (Hindi, Gujarati, Punjabi): ~2-3 chars per token
 *   (these scripts are more compact)
 */

const CHARS_PER_TOKEN_EN = 4;
const CHARS_PER_TOKEN_MULTILINGUAL = 2.5;

/**
 * More accurate token estimation that considers language composition.
 */
export function estimateTextTokens(text: string): number {
  if (!text) {
    return 0;
  }

  // Detect if text contains non-ASCII characters (indicates multilingual content)
  const hasNonAscii = /[^\x00-\x7F]/.test(text);
  const charsPerToken = hasNonAscii ? CHARS_PER_TOKEN_MULTILINGUAL : CHARS_PER_TOKEN_EN;

  // Additional adjustment: count words as another estimation method
  // and take the average for more accuracy
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charBasedEstimate = Math.ceil(text.length / charsPerToken);
  const wordBasedEstimate = Math.ceil(wordCount * 1.3); // Average ~1.3 tokens per word

  // Use the average for more accurate estimation
  return Math.ceil((charBasedEstimate + wordBasedEstimate) / 2);
}

/**
 * Estimates tokens in a Content array (used for chat history context).
 */
export function estimateContentTokens(contents: Content[]): number {
  return contents.reduce((total, item) => {
    const partTokens = item.parts.reduce((sum, part) => {
      if ('text' in part && typeof part.text === 'string') {
        return sum + estimateTextTokens(part.text);
      }

      if ('inlineData' in part && part.inlineData?.data) {
        // Image tokens: Base64 encoding adds ~33% overhead, divide by 6 for approximation
        return sum + Math.ceil(part.inlineData.data.length / 6);
      }

      if ('functionResponse' in part && part.functionResponse) {
        return sum + estimateTextTokens(JSON.stringify(part.functionResponse.response));
      }

      if ('functionCall' in part && part.functionCall) {
        return sum + estimateTextTokens(JSON.stringify(part.functionCall));
      }

      return sum;
    }, 0);

    return total + partTokens;
  }, 0);
}
