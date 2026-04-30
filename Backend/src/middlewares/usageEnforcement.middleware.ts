import { FastifyReply, FastifyRequest } from 'fastify';
import { getWallet } from '../services/walletService';
import { checkLimit } from '../services/subscriptionService';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

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
          throw AppError.paymentRequired('errNoCredits');
        }

        return;
      } catch (walletError) {
        logger.warn({ userId, type, error: walletError }, 'Wallet lookup failed, falling back to subscription limits');
      }

      const status = await checkLimit(userId, type);

      if (!status.allowed) {
        logger.info({ userId, type, reason: status.reason }, 'Usage limit exceeded');
        const key = status.reason === 'EXPIRED' ? 'errSubscriptionExpired' : 'errLimitReached';
        throw AppError.forbidden(key);
      }
    } catch (error) {
      // Re-throw intentional app errors (402 PaymentRequired, 403 Forbidden)
      // These are business logic errors that MUST reach the client.
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ error, type }, 'Unexpected error in usage enforcement middleware');
      // Fail open for truly unexpected errors (DB connection issues, etc.)
      return;
    }
  };
}
