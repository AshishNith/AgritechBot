import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { deductCredit } from './walletService';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: 'LIMIT_REACHED' | 'EXPIRED' | 'NOT_FOUND';
  remaining?: number;
  limit?: number;
  usage?: number;
}

/**
 * Ensures a subscription document exists for the user.
 * If not found, creates a default 'free' subscription.
 */
async function ensureSubscription(userId: string) {
  let sub = await Subscription.findOne({ userId });
  
  if (!sub) {
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(now.getFullYear() + 10); // Free tier basically never expires

    sub = await Subscription.create({
      userId,
      tier: 'free',
      status: 'active',
      startDate: now,
      endDate: endDate,
      queriesUsed: 0,
      scansUsed: 0,
      features: TIER_FEATURES.free
    });
    
    logger.info({ userId }, 'Created default free subscription for user');
  }
  
  return sub;
}

/**
 * Validates if a user has remaining quota to perform an action.
 * Handles automatic monthly reset.
 */
export async function checkLimit(
  userId: string,
  type: 'chat' | 'scan'
): Promise<LimitCheckResult> {
  try {
    const sub = await ensureSubscription(userId);

    const now = new Date();
    
    // Check for expiration (mostly for paid tiers)
    if (sub.tier !== 'free' && sub.endDate < now) {
      logger.info({ userId, tier: sub.tier }, 'Subscription has expired');
      return { allowed: false, reason: 'EXPIRED' };
    }

    // Monthly Reset logic
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    const timeSinceReset = now.getTime() - sub.startDate.getTime();
    
    if (timeSinceReset > oneMonthInMs) {
      logger.info({ userId }, 'Performing monthly usage reset');
      
      // Calculate new start date (should be exactly 1 month after previous or now)
      const newStartDate = new Date(sub.startDate.getTime() + oneMonthInMs);
      // If it's been multiple months, just use now
      const finalStartDate = (now.getTime() - newStartDate.getTime() > oneMonthInMs) ? now : newStartDate;

      await Subscription.updateOne(
        { _id: sub._id },
        { 
          $set: { 
            queriesUsed: 0, 
            scansUsed: 0, 
            startDate: finalStartDate 
          } 
        }
      );
      sub.queriesUsed = 0;
      sub.scansUsed = 0;
      sub.startDate = finalStartDate;
    }

    const currentUsage = type === 'chat' ? sub.queriesUsed : sub.scansUsed;
    const limit = type === 'chat' ? sub.features.chatLimit : sub.features.scanLimit;

    if (limit !== -1 && currentUsage >= limit) {
      return { 
        allowed: false, 
        reason: 'LIMIT_REACHED',
        remaining: 0,
        limit,
        usage: currentUsage
      };
    }

    return { 
      allowed: true, 
      remaining: limit === -1 ? 999 : limit - currentUsage,
      limit,
      usage: currentUsage
    };
  } catch (error) {
    logger.error({ error, userId, type }, 'Error checking subscription limit');
    return { allowed: true }; // Fail open for better UX, but log it
  }
}

/**
 * Increments usage count upon successful completion of the action.
 * Also syncs to User model for backup/easy access.
 */
export async function incrementUsage(
  userId: string,
  type: 'chat' | 'scan'
) {
  try {
    const incField = type === 'chat' ? 'queriesUsed' : 'scansUsed';
    const userIncField = type === 'chat' ? 'usageLimits.chatCount' : 'usageLimits.scanCount';

    // Update Subscription
    await Subscription.updateOne(
      { userId },
      { $inc: { [incField]: 1 } }
    );

    // Sync to User model
    await User.updateOne(
      { _id: userId },
      { $inc: { [userIncField]: 1 } }
    );

    // Sync to Wallet model (New Credit System)
    try {
      const updatedWallet = await deductCredit(userId, type);
      logger.info({ userId, type }, 'Wallet credit sync successful during usage increment');
      return updatedWallet;
    } catch (walletErr) {
      // If it's a credit error, rethrow it so the controller can return 402 if needed
      if (typeof walletErr === 'object' && walletErr !== null && (walletErr as any).code === 'NO_CREDITS') {
        throw walletErr;
      }
      // For other wallet errors (connection, etc), log but don't fail the primary increment
      logger.warn({ userId, type, err: walletErr }, 'Wallet credit sync skipped or failed during usage increment');
      return null;
    }
  } catch (error) {
    logger.error({ error, userId, type }, 'Error incrementing usage');
    throw error;
  }
}

/**
 * Gets the current usage status for a user to display in the UI.
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    const sub = await ensureSubscription(userId);

    return {
      tier: sub.tier,
      chatsUsed: sub.queriesUsed,
      chatsLimit: sub.features.chatLimit,
      scansUsed: sub.scansUsed,
      scansLimit: sub.features.scanLimit,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Error getting subscription status');
    return null;
  }
}
