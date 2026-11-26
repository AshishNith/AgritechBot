import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../../utils/logger';

/**
 * Knowledge base for the chat assistant.
 *
 * With Claude, the knowledge base is sent in the system prompt with a prompt-cache
 * breakpoint (see aiChat.service.ts), so there is no separate cache object to create
 * or refresh. The initialize/stop functions are kept so existing callers still work.
 */

let cachedKbText: string | null = null;

export async function getKnowledgeBaseText(): Promise<string> {
  if (cachedKbText) {
    return cachedKbText;
  }

  const filePath = path.join(__dirname, '..', 'data', 'knowledgeBase.json');
  const file = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(file) as Record<string, unknown>;

  cachedKbText = [
    'Anaaj.ai curated agricultural knowledge base for Indian farming.',
    'Use this information as background knowledge and still adapt to farmer profile, crop stage, and region.',
    // Compact JSON: same content, far fewer tokens on every chat request.
    JSON.stringify(payload),
  ].join('\n\n');

  return cachedKbText;
}

/** Loads the knowledge base into memory at startup. */
export async function initializeKnowledgeBaseCache(): Promise<void> {
  const text = await getKnowledgeBaseText();
  logger.info({ chars: text.length }, 'Knowledge base loaded for Claude prompt caching');
}

/** Kept for graceful-shutdown callers; nothing to stop with Claude prompt caching. */
export function stopKnowledgeBaseCacheRefresh(): void {
  // no-op
}
