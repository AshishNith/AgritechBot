import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AdminLog } from '../models/AdminLog';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';

const logsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['api', 'error', 'ai_failure', 'notification', 'system']).optional()
});

export async function listAdminLogs(request: FastifyRequest, reply: FastifyReply) {
  const parsed = logsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, type } = parsed.data;
  const where = type ? { type } : {};
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AdminLog.find(where).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    AdminLog.countDocuments(where)
  ]);

  return reply.send({
    items: logs.map((log) => ({
      id: String(log._id),
      type: log.type,
      message: log.message,
      timestamp: new Date(log.timestamp).toISOString(),
      meta: log.meta
    })),
    pagination: buildPagination(page, limit, total)
  });
}

