import knowledgeBase from '../data/knowledgeBase.json';
import { ChatMessageModel } from '../models/ChatMessage.model';
import { ChatSessionModel } from '../models/ChatSession.model';
import { detectCurrentSeason } from './contextBuilder.service';

const KNOWN_CROPS = new Set(
  [
    ...knowledgeBase.cropDiseases.map((entry) => entry.crop),
    ...Object.values(knowledgeBase.seasons).flatMap((season) => season.crops),
  ].map((value) => value.toLowerCase())
);

const KNOWN_PROBLEMS = new Set(
  [
    ...knowledgeBase.cropDiseases.map((entry) => entry.disease),
    ...knowledgeBase.pests.map((entry) => entry.name),
  ].map((value) => value.toLowerCase())
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
  if (!trimmed) {
    return 'New chat';
  }

  return trimmed.length > 70 ? `${trimmed.slice(0, 67)}...` : trimmed;
}

export async function createChatSession(params: {
  farmerId: string;
  location?: string;
}): Promise<{
  sessionId: string;
  title: string;
  createdAt: Date;
}> {
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

  const query = { 
    farmerId, 
    status: 'active', 
    $or: [
      { 'metadata.type': 'chat' },
      { 'metadata.type': { $exists: false } }
    ]
  };

  const [sessions, total] = await Promise.all([
    ChatSessionModel.find(query)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatSessionModel.countDocuments(query),
  ]);

  const sessionIds = sessions.map((session) => session._id);
  const latestMessages = sessionIds.length
    ? await ChatMessageModel.aggregate<{ _id: string; preview: string }>([
        { $match: { sessionId: { $in: sessionIds }, 'content.text': { $exists: true } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$sessionId',
            preview: { $first: '$content.text' },
          },
        },
      ])
    : [];

  const previewMap = new Map(latestMessages.map((entry) => [String(entry._id), entry.preview]));

  const normalizedSessions: Array<{
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
  }> = sessions.map((session) => ({
    sessionId: String(session._id),
    title: session.title,
    status: session.status,
    messageCount: session.messageCount,
    updatedAt: session.updatedAt,
    lastMessageAt: session.lastMessageAt,
    preview: previewMap.get(String(session._id)) || '',
    metadata: session.metadata,
  }));

  return {
    sessions: normalizedSessions,
    pagination: { page, limit, total },
  };
}

export async function getChatSessionWithMessages(params: {
  farmerId: string;
  sessionId: string;
  page: number;
  limit: number;
}): Promise<
  | {
      session: {
        sessionId: string;
        _id: string;
        farmerId: unknown;
        title: string;
        status: 'active' | 'archived';
        messageCount: number;
        lastMessageAt: Date;
        metadata: {
          cropsDiscussed: string[];
          problemsSolved: string[];
          location?: string;
          season?: string;
        };
        createdAt: Date;
        updatedAt: Date;
      };
      messages: Array<Record<string, unknown>>;
      totalMessages: number;
    }
  | null
> {
  const { farmerId, sessionId, page, limit } = params;
  const session = await ChatSessionModel.findOne({ _id: sessionId, farmerId }).lean();
  if (!session) {
    return null;
  }

  const skip = (page - 1) * limit;
  const [messages, totalMessages] = await Promise.all([
    ChatMessageModel.find({ sessionId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatMessageModel.countDocuments({ sessionId }),
  ]);

  const normalizedMessages: Array<Record<string, unknown>> = messages.map((message: any) => ({
    ...message,
    _id: String(message._id),
    sessionId: String(message.sessionId),
    farmerId: String(message.farmerId),
    content: message.content?.text || '',
    type: message.content?.type || 'text',
  }));

  return {
    session: {
      sessionId: String(session._id),
      title: session.title,
      status: session.status,
      messageCount: session.messageCount,
      lastMessageAt: session.lastMessageAt,
      metadata: session.metadata,
      _id: String(session._id),
      farmerId: session.farmerId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    messages: normalizedMessages,
    totalMessages,
  };
}

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

  if (!session) {
    return null;
  }

  let cursorDate: Date | undefined;
  if (params.before) {
    const cursorMessage = await ChatMessageModel.findOne({
      _id: params.before,
      sessionId: params.sessionId,
    }).lean();
    cursorDate = cursorMessage?.createdAt;
  }

  const query: Record<string, unknown> = { sessionId: params.sessionId };
  if (cursorDate) {
    query.createdAt = { $lt: cursorDate };
  }

  const messages = await ChatMessageModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit)
    .lean();

  return messages.reverse().map((message: any) => ({
    ...message,
    _id: String(message._id),
    sessionId: String(message.sessionId),
    farmerId: String(message.farmerId),
    content: message.content?.text || '',
    type: message.content?.type || 'text',
  }));
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
  const session = await ChatSessionModel.findOne({ _id: params.sessionId, farmerId: params.farmerId });
  if (!session) {
    return null;
  }

  await ChatMessageModel.deleteMany({ sessionId: params.sessionId });
  session.messageCount = 0;
  session.lastMessageAt = new Date();
  session.metadata.cropsDiscussed = [];
  session.metadata.problemsSolved = [];
  await session.save();
  return session.toObject();
}

export async function ensureSessionOwnership(farmerId: string, sessionId: string) {
  return ChatSessionModel.findOne({ _id: sessionId, farmerId, status: 'active' });
}

export async function touchChatSession(params: {
  sessionId: string;
  location?: string;
  userText: string;
  assistantText: string;
}) {
  const cropsDiscussed = unique([
    ...extractMatches(params.userText, KNOWN_CROPS),
    ...extractMatches(params.assistantText, KNOWN_CROPS),
  ]);
  const problemsSolved = unique([
    ...extractMatches(params.userText, KNOWN_PROBLEMS),
    ...extractMatches(params.assistantText, KNOWN_PROBLEMS),
  ]);

  const session = await ChatSessionModel.findById(params.sessionId);
  if (!session) {
    return;
  }

  if (session.messageCount === 0 && params.userText.trim()) {
    session.title = autoGenerateTitle(params.userText);
  }

  session.messageCount += 2;
  session.lastMessageAt = new Date();
  session.metadata.location = params.location || session.metadata.location;
  session.metadata.season = detectCurrentSeason();
  session.metadata.cropsDiscussed = unique([...session.metadata.cropsDiscussed, ...cropsDiscussed]);
  session.metadata.problemsSolved = unique([...session.metadata.problemsSolved, ...problemsSolved]);

  await session.save();
}
