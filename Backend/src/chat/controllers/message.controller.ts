import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getFarmerContext } from '../services/contextBuilder.service';
import { sendChatMessage, sendVoiceMessage } from '../services/geminiChat.service';
import { clearChatHistory, getSessionMessages } from '../services/sessionManager.service';
import { speechToText } from '../../services/voice/sarvamSTT';
import { logger } from '../../utils/logger';

// ── Validation Schemas ──

const VALID_IMAGE_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in base64

const messageBodySchema = z.object({
  text: z.string().trim().min(1).max(5000),
  language: z.enum(['English', 'Hindi', 'Gujarati', 'Punjabi']).optional(),
  imageBase64: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= MAX_IMAGE_SIZE, {
      message: 'Image exceeds 5MB limit',
    }),
  imageMimeType: z
    .string()
    .optional()
    .refine((val) => !val || VALID_IMAGE_MIME_TYPES.has(val), {
      message: 'Invalid image type. Allowed: jpeg, png, gif, webp, bmp',
    }),
});

const paginationSchema = z.object({
  before: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

// ── Controllers ──

/**
 * POST /api/v1/chat/sessions/:sessionId/message
 * Send a text message to the AI and get a response.
 */
export async function sendMessageController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = messageBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);

  try {
    const result = await sendChatMessage({
      farmerId,
      sessionId,
      text: parsed.data.text,
      preferredLanguage: parsed.data.language,
      imageBase64: parsed.data.imageBase64,
      imageMimeType: parsed.data.imageMimeType,
    });

    return reply.send(result);
  } catch (error: any) {
    // Let the error propagate to Fastify's error handler.
    // HttpError instances carry statusCode + user-friendly message.
    throw error;
  }
}

/**
 * POST /api/v1/chat/sessions/:sessionId/voice
 * Full voice pipeline: STT → AI → TTS
 */
export async function sendVoiceMessageController(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Audio file is required' });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }

  const audioBase64 = Buffer.concat(chunks).toString('base64');
  const language = (data.fields as Record<string, { value?: string }>)?.language?.value as
    | 'English' | 'Hindi' | 'Gujarati' | 'Punjabi' | undefined;

  const result = await sendVoiceMessage({
    farmerId,
    sessionId,
    audioBase64,
    mimeType: data.mimetype || 'audio/m4a',
    fileName: data.filename || 'voice-query.m4a',
    preferredLanguage: language,
  });

  return reply.send(result);
}

/**
 * GET /api/v1/chat/sessions/:sessionId/messages
 * Fetch paginated messages for a chat session.
 */
export async function getSessionMessagesController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paginationSchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const messages = await getSessionMessages({
    farmerId,
    sessionId,
    limit: parsed.data.limit,
    before: parsed.data.before,
  });

  if (!messages) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({ sessionId, messages });
}

/**
 * GET /api/v1/chat/context
 * Get current farmer context (profile, season, location).
 */
export async function getChatContextController(request: FastifyRequest, reply: FastifyReply) {
  const farmerId = String(request.user!._id);
  const context = await getFarmerContext(farmerId);
  return reply.send(context);
}

/**
 * DELETE /api/v1/chat/sessions/:sessionId/history
 * Clear all messages in a chat session.
 */
export async function clearHistoryController(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const result = await clearChatHistory({ farmerId, sessionId });

  if (!result) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({ message: 'Chat history cleared', sessionId });
}

/**
 * POST /api/v1/chat/voice-input
 * STT-only: transcribe audio and return the text. No AI call, no TTS.
 */
export async function voiceInputController(request: FastifyRequest, reply: FastifyReply) {
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Audio file is required' });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }

  const audioBase64 = Buffer.concat(chunks).toString('base64');
  const language = (data.fields as Record<string, { value?: string }>)?.language?.value as
    | 'English' | 'Hindi' | 'Gujarati' | 'Punjabi' | undefined;
  const mimeType = data.mimetype || 'audio/m4a';
  const fileName = data.filename || 'voice-input.m4a';

  const result = await speechToText(audioBase64, language, mimeType, fileName);

  return reply.send({
    transcript: result.text,
    language: result.language,
  });
}
