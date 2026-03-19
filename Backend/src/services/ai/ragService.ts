import { ChromaClient, Collection } from 'chromadb';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

let client: ChromaClient | null = null;
let collection: Collection | null = null;
let chromaRetryAt = 0;

const CHROMA_RETRY_BACKOFF_MS = 60_000;

async function getCollection(): Promise<Collection> {
  if (collection) return collection;

  if (Date.now() < chromaRetryAt) {
    throw new Error('ChromaDB temporarily unavailable; retry backoff active');
  }

  try {
    client = new ChromaClient({ path: env.CHROMA_URL });
    collection = await client.getOrCreateCollection({
      name: env.CHROMA_COLLECTION,
      metadata: { description: 'Agricultural knowledge base for Anaaj AI' },
    });
    chromaRetryAt = 0;
    logger.info(`ChromaDB collection '${env.CHROMA_COLLECTION}' ready`);
    return collection;
  } catch (err) {
    client = null;
    collection = null;
    chromaRetryAt = Date.now() + CHROMA_RETRY_BACKOFF_MS;

    logger.warn(
      {
        message: err instanceof Error ? err.message : 'unknown-error',
        retryInMs: CHROMA_RETRY_BACKOFF_MS,
      },
      'Failed to connect to ChromaDB; entering retry backoff'
    );
    throw err;
  }
}

/**
 * Query the vector DB for relevant agricultural context.
 */
export async function retrieveContext(query: string, topK: number = 3): Promise<string> {
  try {
    const col = await getCollection();

    const results = await col.query({
      queryTexts: [query],
      nResults: topK,
    });

    if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
      return '';
    }

    // Combine relevant documents
    const context = results.documents[0]
      .filter((doc): doc is string => doc !== null)
      .join('\n\n---\n\n');

    logger.debug({ query, docsFound: results.documents[0].length }, 'RAG context retrieved');
    return context;
  } catch (err) {
    logger.warn(
      { message: err instanceof Error ? err.message : 'unknown-error' },
      'RAG retrieval failed, proceeding without context'
    );
    return '';
  }
}

/**
 * Add documents to the vector DB knowledge base.
 */
export async function addDocuments(
  documents: string[],
  ids: string[],
  metadata?: Array<Record<string, string>>
): Promise<void> {
  try {
    const col = await getCollection();
    await col.upsert({
      documents,
      ids,
      metadatas: metadata,
    });
    logger.info(`Upserted ${documents.length} documents to vector DB`);
  } catch (err) {
    logger.error({ err }, 'Failed to add documents to vector DB');
    throw err;
  }
}
