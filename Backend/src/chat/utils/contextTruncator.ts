import { estimateContentTokens, estimateTextTokens, type HistoryTurn } from './tokenCounter';

export interface TruncationResult {
  /** Recent turns to send to the model, oldest first. */
  contents: HistoryTurn[];
  /** Summary of older turns that were dropped, when a summary was made. */
  summary?: string;
  summaryUsed: boolean;
}

export async function truncateConversationToBudget(params: {
  historyContents: HistoryTurn[];
  availableTokens: number;
  summarizeOlderMessages: (olderContents: HistoryTurn[]) => Promise<string>;
}): Promise<TruncationResult> {
  const { historyContents, availableTokens, summarizeOlderMessages } = params;

  if (estimateContentTokens(historyContents) <= availableTokens) {
    return { contents: historyContents, summaryUsed: false };
  }

  if (historyContents.length <= 20) {
    return { contents: historyContents, summaryUsed: false };
  }

  let recent = historyContents.slice(-20);
  const older = historyContents.slice(0, -20);
  const summary = await summarizeOlderMessages(older);
  const summaryTokens = estimateTextTokens(summary);

  // Drop the oldest exchanges until the history fits.
  while (estimateContentTokens(recent) + summaryTokens > availableTokens && recent.length > 2) {
    recent = recent.slice(2);
  }

  // Still too long: shorten very long messages.
  if (estimateContentTokens(recent) + summaryTokens > availableTokens) {
    recent = recent.map((turn) => ({
      ...turn,
      text: estimateTextTokens(turn.text) > 500 ? `${turn.text.slice(0, 1800)}...` : turn.text,
    }));
  }

  return {
    contents: recent,
    summary,
    summaryUsed: true,
  };
}
