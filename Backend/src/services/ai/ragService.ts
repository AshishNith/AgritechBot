import { ChromaClient, Collection, IEmbeddingFunction } from 'chromadb';
import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

let client: ChromaClient | null = null;
let collection: Collection | null = null;
let chromaRetryAt = 0;

const CHROMA_RETRY_BACKOFF_MS = 60_000;
const CHROMA_OP_TIMEOUT_MS = 30_000;

class SarvamEmbeddingFunction implements IEmbeddingFunction {
  private apiKey: string;
  private endpoint = 'https://api.sarvam.ai/v1/embeddings';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        this.endpoint,
        {
          inputs: texts,
          model: 'sarvam-2k-v1',
        },
        {
          headers: {
            'api-subscription-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.embeddings;
    } catch (err: any) {
      logger.error({ err: err?.response?.data || err.message }, 'Sarvam embedding generation failed');
      throw err;
    }
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, opName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${opName} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function isBackoffActive(): boolean {
  return Date.now() < chromaRetryAt;
}

export async function getCollection(): Promise<Collection> {
  if (collection) return collection;

  if (isBackoffActive()) {
    throw new Error('ChromaDB temporarily unavailable; retry backoff active');
  }

  try {
    const embeddingFunction = new SarvamEmbeddingFunction(env.SARVAM_API_KEY!);
    client = new ChromaClient({ path: env.CHROMA_URL });
    
    collection = await client.getOrCreateCollection({
      name: env.CHROMA_COLLECTION,
      metadata: { description: 'Agricultural knowledge base for Anaaj AI' },
      embeddingFunction,
    });
    
    chromaRetryAt = 0;
    logger.info(`ChromaDB collection '${env.CHROMA_COLLECTION}' ready with Sarvam embeddings`);
    return collection;
  } catch (err) {
    client = null;
    collection = null;
    chromaRetryAt = Date.now() + CHROMA_RETRY_BACKOFF_MS;
    logger.error({ err }, 'Failed to connect to ChromaDB');
    throw err;
  }
}

export async function retrieveContext(query: string, topK: number = 3): Promise<string> {
  try {
    const col = await getCollection();

    const results = await withTimeout(
      col.query({
        queryTexts: [query],
        nResults: topK,
      }),
      CHROMA_OP_TIMEOUT_MS,
      'ChromaDB query'
    );

    if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
      return '';
    }

    const context = results.documents[0]
      .filter((doc: string | null): doc is string => doc !== null)
      .join('\n\n---\n\n');

    logger.debug({ query, docsFound: results.documents[0].length }, 'RAG context retrieved');
    return context;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';

    if (message.includes('retry backoff active')) {
      logger.debug('RAG skipped: ChromaDB retry backoff active');
      return '';
    }

    logger.error({ err }, 'RAG context retrieval failed');
    return '';
  }
}

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
    console.error('CRITICAL: addDocuments failed:', err);
    logger.error({ err: err instanceof Error ? { message: err.message, stack: err.stack } : err }, 'Failed to add documents to vector DB');
    throw err;
  }
}
