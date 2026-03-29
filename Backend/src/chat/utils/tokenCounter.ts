import type { Content } from '@google/generative-ai';

const AVERAGE_CHARS_PER_TOKEN = 4;

export function estimateTextTokens(text: string): number {
  if (!text) {
    return 0;
  }

  return Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN);
}

export function estimateContentTokens(contents: Content[]): number {
  return contents.reduce((total, item) => {
    const partTokens = item.parts.reduce((sum, part) => {
      if ('text' in part && typeof part.text === 'string') {
        return sum + estimateTextTokens(part.text);
      }

      if ('inlineData' in part && part.inlineData?.data) {
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
