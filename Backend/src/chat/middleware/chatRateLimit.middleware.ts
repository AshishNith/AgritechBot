import { FastifyReply, FastifyRequest } from 'fastify';
import { cache } from '../../services/cache/redisCache';
import { ChatMessageModel } from '../models/ChatMessage.model';

const lastSeenByFarmer = new Map<string, number>();

export async function chatRateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const farmerId = String(request.user!._id);

  const shortWindowKey = `chat:rate:${farmerId}:3s`;
  const hourWindowKey = `chat:rate:${farmerId}:1h`;

  const shortCount = await cache.increment(shortWindowKey, 3);
  if (shortCount > 1) {
    return reply.status(429).send({
      error: 'Please wait a few seconds before sending another message.',
      retryAfterSeconds: 3,
    });
  }

  const hourCount = await cache.increment(hourWindowKey, 60 * 60);
  if (hourCount > 60) {
    return reply.status(429).send({
      error: 'Hourly chat message limit reached. Please try again later.',
      retryAfterSeconds: 3600,
    });
  }

  if (shortCount === 0 || hourCount === 0) {
    const now = Date.now();
    const lastSeen = lastSeenByFarmer.get(farmerId) || 0;
    if (now - lastSeen < 3000) {
      return reply.status(429).send({
        error: 'Please wait a few seconds before sending another message.',
        retryAfterSeconds: 3,
      });
    }

    lastSeenByFarmer.set(farmerId, now);
    const hourMessages = await ChatMessageModel.countDocuments({
      farmerId,
      role: 'user',
      createdAt: { $gte: new Date(now - 60 * 60 * 1000) },
    });
    if (hourMessages >= 60) {
      return reply.status(429).send({
        error: 'Hourly chat message limit reached. Please try again later.',
        retryAfterSeconds: 3600,
      });
    }
  }
}
