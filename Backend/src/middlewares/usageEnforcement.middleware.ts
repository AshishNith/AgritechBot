import { FastifyReply, FastifyRequest } from 'fastify';
import { getWallet } from '../services/walletService';
import { checkLimit } from '../services/subscriptionService';
import { logger } from '../utils/logger';

export function createUsageEnforcementMiddleware(type: 'chat' | 'scan') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user!._id.toString();
      try {
        const wallet = await getWallet(userId);

        // ✅ CHECK PLAN EXPIRY - Automatically downgrade to free tier if expired
        const now = new Date();
        if (wallet.planExpiry && wallet.planExpiry < now && wallet.plan !== 'free') {
          logger.warn(
            { userId, plan: wallet.plan, planExpiry: wallet.planExpiry },
            'Plan expired - downgrading to free tier'
          );

          // Downgrade to free tier
          wallet.plan = 'free';
          wallet.planExpiry = null;
          wallet.chatCredits = 10; // Free tier limits
          wallet.imageCredits = 1;
          await wallet.save();
        }

        const totalCredits =
          type === 'chat'
            ? wallet.chatCredits + wallet.topupCredits
            : wallet.imageCredits + wallet.topupImageCredits;

        if (totalCredits <= 0) {
          logger.info({ userId, type }, 'Wallet credits exhausted');

          return reply.status(402).send({
            error: 'NO_CREDITS',
            message: 'Aapke credits khatam ho gaye. Topup ya subscribe karo.',
            code: 'NO_CREDITS',
            upgradeRequired: true,
            limitType: type,
          });
        }

        return;
      } catch (walletError) {
        logger.warn({ userId, type, error: walletError }, 'Wallet lookup failed, falling back to subscription limits');
      }

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
