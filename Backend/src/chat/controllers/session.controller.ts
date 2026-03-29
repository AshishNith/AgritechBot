import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getFarmerContext } from '../services/contextBuilder.service';
import {
  archiveChatSession,
  createChatSession,
  getChatSessionWithMessages,
  listChatSessions,
  renameChatSession,
} from '../services/sessionManager.service';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

const renameSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function createSessionController(request: FastifyRequest, reply: FastifyReply) {
  const farmerId = String(request.user!._id);
  const farmerContext = await getFarmerContext(farmerId);
  const session = await createChatSession({ farmerId, location: farmerContext.location });
  return reply.send(session);
}

export async function listSessionsController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paginationSchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const farmerId = String(request.user!._id);
  const result = await listChatSessions({
    farmerId,
    page: parsed.data.page,
    limit: parsed.data.limit,
  });

  return reply.send(result);
}

export async function getSessionController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paginationSchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const result = await getChatSessionWithMessages({
    farmerId,
    sessionId,
    page: parsed.data.page,
    limit: parsed.data.limit,
  });

  if (!result) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send(result);
}

export async function updateSessionController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = renameSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const session = await renameChatSession({
    farmerId,
    sessionId,
    title: parsed.data.title,
  });

  if (!session) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({
    sessionId: String(session._id),
    title: session.title,
    updatedAt: session.updatedAt,
  });
}

export async function archiveSessionController(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const session = await archiveChatSession({ farmerId, sessionId });

  if (!session) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({ message: 'Chat session archived', sessionId });
}
