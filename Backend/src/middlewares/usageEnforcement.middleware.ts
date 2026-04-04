import { FastifyReply, FastifyRequest } from 'fastify';
import { checkLimit } from '../services/subscriptionService';
import { logger } from '../utils/logger';

export function createUsageEnforcementMiddleware(type: 'chat' | 'scan') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user!._id.toString();
      const status = await checkLimit(userId, type);

      if (!status.allowed) {
        logger.info({ userId, type, reason: status.reason }, 'Usage limit exceeded');

        let message = 'Your usage limit has been reached.';
        if (status.reason === 'LIMIT_REACHED') {
          message = `You have used ${status.usage} of your ${status.limit} ${type}s. Please upgrade to continue.`;
        } else if (status.reason === 'EXPIRED') {
          message = 'Your subscription has expired. Please renew to continue.';
        }

        return reply.status(403).send({
          error: 'LIMIT_EXCEEDED',
          message,
          code: 'SUBSCRIPTION_LIMIT_REACHED',
          upgradeRequired: true,
          limitType: type,
          currentUsage: status.usage,
          maxLimit: status.limit,
        });
      }
    } catch (error) {
      logger.error({ error, type }, 'Error in usage enforcement middleware');
      // Fail open for better UX, though this shouldn't happen
      return;
    }
  };
}
