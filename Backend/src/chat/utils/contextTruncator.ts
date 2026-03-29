import type { Content } from '@google/generative-ai';
import { estimateContentTokens, estimateTextTokens } from './tokenCounter';

export interface TruncationResult {
  contents: Content[];
  summaryUsed: boolean;
}

export async function truncateConversationToBudget(params: {
  historyContents: Content[];
  availableTokens: number;
  summarizeOlderMessages: (olderContents: Content[]) => Promise<string>;
}): Promise<TruncationResult> {
  const { historyContents, availableTokens, summarizeOlderMessages } = params;

  if (estimateContentTokens(historyContents) <= availableTokens) {
    return { contents: historyContents, summaryUsed: false };
  }

  if (historyContents.length <= 20) {
    return { contents: historyContents, summaryUsed: false };
  }

  const recentContents = historyContents.slice(-20);
  const olderContents = historyContents.slice(0, -20);
  const summary = await summarizeOlderMessages(olderContents);
  const summaryContent: Content = {
    role: 'system',
    parts: [{ text: `CONVERSATION SUMMARY SO FAR: ${summary}` }],
  };

  let combined = [summaryContent, ...recentContents];

  while (estimateContentTokens(combined) > availableTokens && combined.length > 21) {
    combined = [summaryContent, ...combined.slice(2)];
  }

  if (estimateContentTokens(combined) > availableTokens) {
    combined = [
      summaryContent,
      ...combined.slice(1).map((content) => ({
        ...content,
        parts: content.parts.map((part) => {
          if (!('text' in part) || typeof part.text !== 'string') {
            return part;
          }

          const limitedText =
            estimateTextTokens(part.text) > 500 ? `${part.text.slice(0, 1800)}...` : part.text;
          return { text: limitedText };
        }),
      })),
    ];
  }

  return {
    contents: combined,
    summaryUsed: true,
  };
}
