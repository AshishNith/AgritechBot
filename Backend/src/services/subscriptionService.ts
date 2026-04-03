import { Subscription } from '../models/Subscription';
import { logger } from '../utils/logger';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: 'LIMIT_REACHED' | 'EXPIRED' | 'NOT_FOUND';
  remaining?: number;
}

/**
 * Validates if a user has remaining quota to perform an action.
 */
export async function checkLimit(
  userId: string,
  type: 'chat' | 'scan'
): Promise<LimitCheckResult> {
  try {
    const sub = await Subscription.findOne({ userId });

    if (!sub) {
      logger.warn({ userId }, 'Subscription document not found for user');
      return { allowed: false, reason: 'NOT_FOUND' };
    }

    const now = new Date();
    if (sub.tier !== 'free' && sub.endDate < now) {
      logger.info({ userId, tier: sub.tier }, 'Subscription has expired');
      return { allowed: false, reason: 'EXPIRED' };
    }

    // Monthly Reset logic (handled at check-time)
    const monthInMs = 30 * 24 * 60 * 60 * 1000;
    if (sub.tier !== 'free' && now.getTime() - sub.startDate.getTime() > monthInMs) {
      // Only reset if we are past the 30-day billing cycle
      // In a real app, this would be updated on payment recurrence
      await Subscription.updateOne(
        { _id: sub._id },
        { $set: { queriesUsed: 0, scansUsed: 0, startDate: now } }
      );
      sub.queriesUsed = 0;
      sub.scansUsed = 0;
    }

    const currentUsage = type === 'chat' ? sub.queriesUsed : sub.scansUsed;
    const limit = type === 'chat' ? sub.features.chatLimit : sub.features.scanLimit;

    if (limit !== -1 && currentUsage >= limit) {
      return { 
        allowed: false, 
        reason: 'LIMIT_REACHED',
        remaining: 0 
      };
    }

    return { 
      allowed: true, 
      remaining: limit === -1 ? 999 : limit - currentUsage 
    };
  } catch (error) {
    logger.error({ error, userId, type }, 'Error checking subscription limit');
    return { allowed: true }; 
  }
}

/**
 * Increments usage count upon successful completion of the action.
 */
export async function incrementUsage(
  userId: string,
  type: 'chat' | 'scan'
) {
  const incField = type === 'chat' ? 'queriesUsed' : 'scansUsed';
  await Subscription.updateOne(
    { userId },
    { $inc: { [incField]: 1 } }
  );
}

/**
 * Gets the current usage status for a user to display in the UI.
 */
export async function getSubscriptionStatus(userId: string) {
  const sub = await Subscription.findOne({ userId });
  if (!sub) return null;

  return {
    tier: sub.tier,
    chatsUsed: sub.queriesUsed,
    chatsLimit: sub.features.chatLimit,
    scansUsed: sub.scansUsed,
    scansLimit: sub.features.scanLimit,
    expiresAt: sub.endDate,
  };
}
