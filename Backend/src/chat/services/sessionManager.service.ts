/**
 * sessionManager.service.ts — Clean rewrite.
 *
 * This manages chat sessions (CRUD) and message retrieval.
 * Key fix: getSessionMessages normalizes `content` correctly —
 * old code did `message.content?.text` which breaks when content
 * is stored as a plain string (not { text, type }).
 */

import mongoose from 'mongoose';
import knowledgeBase from '../data/knowledgeBase.json';
import { ChatMessageModel } from '../models/ChatMessage.model';
import { ChatSessionModel } from '../models/ChatSession.model';
import { detectCurrentSeason } from './contextBuilder.service';

// ── Knowledge sets for metadata extraction ──

const KNOWN_CROPS = new Set(
  [
    ...knowledgeBase.cropDiseases.map((entry) => entry.crop),
    ...Object.values(knowledgeBase.seasons).flatMap((season) => season.crops),
  ].map((v) => v.toLowerCase())
);

const KNOWN_PROBLEMS = new Set(
  [
    ...knowledgeBase.cropDiseases.map((entry) => entry.disease),
    ...knowledgeBase.pests.map((entry) => entry.name),
  ].map((v) => v.toLowerCase())
);

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function extractMatches(text: string, dictionary: Set<string>): string[] {
  const lower = text.toLowerCase();
  return [...dictionary].filter((item) => lower.includes(item));
}

function autoGenerateTitle(text?: string): string {
  const trimmed = (text || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'New chat';
  return trimmed.length > 70 ? `${trimmed.slice(0, 67)}...` : trimmed;
}

// ── Session CRUD ──

export async function createChatSession(params: {
  farmerId: string;
  location?: string;
}): Promise<{ sessionId: string; title: string; createdAt: Date }> {
  const session = await ChatSessionModel.create({
    farmerId: params.farmerId,
    title: 'New chat',
    metadata: {
      cropsDiscussed: [],
      problemsSolved: [],
      location: params.location,
      season: detectCurrentSeason(),
    },
  });

  return {
    sessionId: String(session._id),
    title: session.title,
    createdAt: session.createdAt,
  };
}

export async function listChatSessions(params: {
  farmerId: string;
  page: number;
  limit: number;
}): Promise<{
  sessions: Array<{
    sessionId: string;
    title: string;
    status: 'active' | 'archived';
    messageCount: number;
    updatedAt: Date;
    lastMessageAt: Date;
    preview: string;
    metadata: {
      cropsDiscussed: string[];
      problemsSolved: string[];
      location?: string;
      season?: string;
    };
  }>;
  pagination: { page: number; limit: number; total: number };
}> {
  const { farmerId, page, limit } = params;
  const skip = (page - 1) * limit;
  const farmerObjectId = new mongoose.Types.ObjectId(farmerId);

  const query = {
    farmerId: farmerObjectId,
    status: 'active',
    $or: [{ 'metadata.type': 'chat' }, { 'metadata.type': { $exists: false } }],
  };

  const [sessions, total] = await Promise.all([
    ChatSessionModel.find(query).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean(),
    ChatSessionModel.countDocuments(query),
  ]);

  return {
    sessions: sessions.map((session) => ({
      sessionId: String(session._id),
      title: session.title,
      status: session.status,
      messageCount: session.messageCount,
      updatedAt: session.updatedAt,
      lastMessageAt: session.lastMessageAt,
      preview: session.metadata?.lastMessagePreview || '',
      metadata: session.metadata,
    })),
    pagination: { page, limit, total },
  };
}

export async function renameChatSession(params: {
  farmerId: string;
  sessionId: string;
  title: string;
}) {
  return ChatSessionModel.findOneAndUpdate(
    { _id: params.sessionId, farmerId: params.farmerId },
    { $set: { title: params.title.trim() } },
    { new: true }
  ).lean();
}

export async function archiveChatSession(params: { farmerId: string; sessionId: string }) {
  return ChatSessionModel.findOneAndUpdate(
    { _id: params.sessionId, farmerId: params.farmerId },
    { $set: { status: 'archived' } },
    { new: true }
  ).lean();
}

export async function clearChatHistory(params: { farmerId: string; sessionId: string }) {
  const session = await ChatSessionModel.findOne({
    _id: params.sessionId,
    farmerId: params.farmerId,
  });
  if (!session) return null;

  await ChatMessageModel.deleteMany({ sessionId: params.sessionId });
  session.messageCount = 0;
  session.lastMessageAt = new Date();
  session.metadata.cropsDiscussed = [];
  session.metadata.problemsSolved = [];
  await session.save();
  return session.toObject();
}

// ── Message retrieval ──

/**
 * Get messages for a session, paginated.
 *
 * CRITICAL FIX: The `content` field in MongoDB can be stored as either:
 *   - A plain string (from the new persistExchange in geminiChat.service)
 *   - An object like { text: "...", type: "text" } (legacy format)
 *
 * The normalization handles BOTH cases, preventing empty content on reload.
 */
export async function getSessionMessages(params: {
  farmerId: string;
  sessionId: string;
  limit: number;
  before?: string;
}): Promise<Array<Record<string, unknown>> | null> {
  const session = await ChatSessionModel.findOne({
    _id: params.sessionId,
    farmerId: params.farmerId,
  }).lean();

  if (!session) return null;

  let cursorDate: Date | undefined;
  if (params.before) {
    const cursorMessage = await ChatMessageModel.findOne({
      _id: params.before,
      sessionId: params.sessionId,
    }).lean();
    cursorDate = cursorMessage?.createdAt;
  }

  const query: Record<string, unknown> = {
    sessionId: params.sessionId,
    // Only return user + assistant messages (no system/tool messages)
    role: { $in: ['user', 'assistant'] },
    // Exclude tool_call and tool_result content types
    'content.type': { $nin: ['tool_call', 'tool_result'] },
  };
  if (cursorDate) {
    query.createdAt = { $lt: cursorDate };
  }

  const messages = await ChatMessageModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit)
    .lean();

  return messages
    .reverse()
    .map((message: any) => {
      // Normalize content: handle both string and {text, type} formats
      let content: string;
      if (typeof message.content === 'string') {
        content = message.content;
      } else if (message.content && typeof message.content === 'object') {
        content = message.content.text || '';
      } else {
        content = '';
      }

      return {
        _id: String(message._id),
        sessionId: String(message.sessionId),
        farmerId: String(message.farmerId),
        role: message.role,
        content,
        type: message.content?.type || 'text',
        language: message.language,
        metadata: message.metadata,
        createdAt: message.createdAt,
      };
    })
    // Filter out any message with empty content after normalization
    .filter((msg) => msg.content.trim().length > 0);
}

/**
 * Touch a chat session after a successful exchange.
 * Updates title (on first message), message count, crops, problems, preview.
 */
export async function touchChatSession(
  sessionId: string,
  userText: string,
  assistantText: string,
  location?: string
): Promise<void> {
  const session = await ChatSessionModel.findById(sessionId);
  if (!session) return;

  // Auto-title from first user message
  if (session.messageCount === 0 && userText.trim()) {
    session.title = autoGenerateTitle(userText);
  }

  // Extract metadata
  const cropsDiscussed = unique([
    ...extractMatches(userText, KNOWN_CROPS),
    ...extractMatches(assistantText, KNOWN_CROPS),
  ]);
  const problemsSolved = unique([
    ...extractMatches(userText, KNOWN_PROBLEMS),
    ...extractMatches(assistantText, KNOWN_PROBLEMS),
  ]);

  session.messageCount += 2;
  session.lastMessageAt = new Date();
  session.metadata.location = location || session.metadata.location;
  session.metadata.season = detectCurrentSeason();
  session.metadata.cropsDiscussed = unique([
    ...session.metadata.cropsDiscussed,
    ...cropsDiscussed,
  ]);
  session.metadata.problemsSolved = unique([
    ...session.metadata.problemsSolved,
    ...problemsSolved,
  ]);
  session.metadata.lastMessagePreview =
    assistantText.trim().substring(0, 200) || userText.trim().substring(0, 200);

  await session.save();
}

export async function ensureSessionOwnership(farmerId: string, sessionId: string) {
  return ChatSessionModel.findOne({ _id: sessionId, farmerId, status: 'active' });
}
