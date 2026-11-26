import { logger } from '../../utils/logger';
import { createMessage, CLAUDE_SUGGESTIONS_MODEL, getResponseText } from '../../services/ai/claudeClient';
import type { HistoryTurn } from '../utils/tokenCounter';

function fallbackSummary(turns: HistoryTurn[]): string {
  const joined = turns
    .map((turn) => turn.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return joined.length > 400 ? `${joined.slice(0, 400)}...` : joined || 'Previous conversation covered crop issues and advice.';
}

export async function summarizeConversationHistory(turns: HistoryTurn[]): Promise<string> {
  if (!turns.length) {
    return '';
  }

  const transcript = turns
    .map((turn) => `${turn.role === 'assistant' ? 'Assistant' : 'Farmer'}: ${turn.text}`)
    .join('\n\n');

  try {
    const response = await createMessage(
      {
        model: CLAUDE_SUGGESTIONS_MODEL,
        max_tokens: 4000,
        output_config: { effort: 'low' },
        system:
          'You summarize conversations between an Indian farmer and the Anaaj AI farming assistant.',
        messages: [
          {
            role: 'user',
            content: `<conversation>\n${transcript}\n</conversation>\n\nSummarize this conversation in 3-5 sentences, capturing the key problems discussed and advice given. Be factual and brief. Reply with the summary only.`,
          },
        ],
      },
      { timeout: 20_000 }
    );

    const text = getResponseText(response);
    return text || fallbackSummary(turns);
  } catch (error) {
    logger.warn({ err: error }, 'Conversation summarization failed; using fallback summary');
    return fallbackSummary(turns);
  }
}
