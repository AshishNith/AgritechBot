import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { addDocuments } from '../services/ai/ragService';
import { logger } from '../utils/logger';

const DEFAULT_KNOWLEDGE_DIR = path.resolve(process.cwd(), 'knowledge');
const SUPPORTED_EXTENSIONS = new Set(['.txt', '.md', '.json']);
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 180;

function toSafeString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  if (normalized.length <= size) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + size, normalized.length);
    const piece = normalized.slice(start, end).trim();
    if (piece.length > 0) {
      chunks.push(piece);
    }

    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

async function listKnowledgeFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(rootDir);
  return files;
}

function buildId(filePath: string, chunkIndex: number, content: string): string {
  const hash = createHash('sha1')
    .update(filePath)
    .update('|')
    .update(String(chunkIndex))
    .update('|')
    .update(content)
    .digest('hex')
    .slice(0, 16);
  return `kb_${hash}`;
}

async function parseFile(filePath: string): Promise<string[]> {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');

  if (ext === '.json') {
    const jsonValue = JSON.parse(raw) as unknown;
    if (Array.isArray(jsonValue)) {
      return jsonValue.map((item) => toSafeString(item));
    }
    if (typeof jsonValue === 'object' && jsonValue !== null) {
      return [toSafeString(jsonValue)];
    }
    return [toSafeString(jsonValue)];
  }

  return [raw];
}

async function ingest(): Promise<void> {
  const knowledgeDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_KNOWLEDGE_DIR;

  const exists = await fs
    .access(knowledgeDir)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    logger.error({ knowledgeDir }, 'Knowledge directory not found');
    process.exit(1);
  }

  const files = await listKnowledgeFiles(knowledgeDir);
  if (files.length === 0) {
    logger.warn({ knowledgeDir }, 'No knowledge files found');
    return;
  }

  const documents: string[] = [];
  const ids: string[] = [];
  const metadatas: Array<Record<string, string>> = [];

  for (const filePath of files) {
    const relPath = path.relative(knowledgeDir, filePath).replace(/\\/g, '/');
    const texts = await parseFile(filePath);

    texts.forEach((text, sourceIndex) => {
      const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
      chunks.forEach((chunk, chunkIndex) => {
        documents.push(chunk);
        ids.push(buildId(relPath, sourceIndex * 10_000 + chunkIndex, chunk));
        metadatas.push({
          source: relPath,
          source_index: String(sourceIndex),
          chunk_index: String(chunkIndex),
          chunk_size: String(chunk.length),
        });
      });
    });
  }

  if (documents.length === 0) {
    logger.warn('No chunks produced from knowledge files');
    return;
  }

  await addDocuments(documents, ids, metadatas);
  logger.info(
    {
      files: files.length,
      chunks: documents.length,
      knowledgeDir,
    },
    'Knowledge base ingestion completed'
  );
}

void ingest().catch((err) => {
  logger.error(
    { err: err instanceof Error ? err.message : err },
    'Knowledge ingestion failed. Ensure ChromaDB is running and CHROMA_URL is reachable.'
  );
  process.exit(1);
});
