import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Order } from '../models/Order';
import { Subscription } from '../models/Subscription';
import { getQueueHealth } from '../services/queue/queue';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function ensureAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (request.user?.role === 'admin') return true;

  logger.warn(
    {
      reqId: request.id,
      route: request.routeOptions.url || request.url,
      ip: request.ip,
      userId: request.user ? String(request.user._id) : undefined,
      role: request.user?.role,
    },
    'Admin controller denied non-admin request'
  );
  reply.status(403).send({ error: 'Admin access required' });
  return false;
}

/**
 * GET /api/admin/stats
 * Admin dashboard statistics.
 */
export async function getStats(_request: FastifyRequest, reply: FastifyReply) {
  if (!ensureAdmin(_request, reply)) return;

  const [totalUsers, totalChats, totalOrders, activeSubscriptions] = await Promise.all([
    User.countDocuments(),
    Chat.countDocuments(),
    Order.countDocuments(),
    Subscription.countDocuments({ status: 'active', tier: { $ne: 'free' } }),
  ]);

  return reply.send({
    totalUsers,
    totalChats,
    totalOrders,
    activeSubscriptions,
  });
}

/**
 * GET /api/admin/users
 * List all users (paginated).
 */
export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  if (!ensureAdmin(request, reply)) return;

  const parsedQuery = listUsersQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return reply.status(400).send({ error: parsedQuery.error.flatten().fieldErrors });
  }

  const { page, limit } = parsedQuery.data;

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await User.countDocuments();

  return reply.send({
    users,
    pagination: { page, limit, total },
  });
}

/**
 * GET /api/admin/queues
 * Queue health and metrics.
 */
export async function getQueuesHealth(_request: FastifyRequest, reply: FastifyReply) {
  if (!ensureAdmin(_request, reply)) return;

  const [queues, redisInfo] = await Promise.all([
    getQueueHealth(),
    redis.info('memory').then((info) => {
      const match = info.match(/used_memory_human:(.+)/);
      return match ? match[1].trim() : 'unknown';
    }),
  ]);

  return reply.send({
    queues,
    redis: { memoryUsage: redisInfo },
  });
}
