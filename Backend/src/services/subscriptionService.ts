import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { deductCredit } from './walletService';
import mongoose from 'mongoose';

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
 * Handles automatic monthly reset based on calendar month (1st of each month).
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

    // Monthly Reset logic - use calendar month (1st of each month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastResetMonthStart = new Date(sub.startDate.getFullYear(), sub.startDate.getMonth(), 1);
    
    if (currentMonthStart.getTime() > lastResetMonthStart.getTime()) {
      logger.info({ userId, lastReset: sub.startDate }, 'Performing monthly usage reset (calendar month)');

      await Subscription.updateOne(
        { _id: sub._id },
        { 
          $set: { 
            queriesUsed: 0, 
            scansUsed: 0,
            startDate: currentMonthStart 
          } 
        }
      );
      sub.queriesUsed = 0;
      sub.scansUsed = 0;
      sub.startDate = currentMonthStart;
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
 * Also syncs to User model atomically using MongoDB transactions.
 * Note: Wallet credit deduction is handled separately in geminiChat.service.ts
 */
export async function incrementUsage(
  userId: string,
  type: 'chat' | 'scan'
) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const incField = type === 'chat' ? 'queriesUsed' : 'scansUsed';
    const userIncField = type === 'chat' ? 'usageLimits.chatCount' : 'usageLimits.scanCount';

    // Update Subscription
    await Subscription.updateOne(
      { userId },
      { $inc: { [incField]: 1 } },
      { session }
    );

    // Sync to User model
    await User.updateOne(
      { _id: userId },
      { $inc: { [userIncField]: 1 } },
      { session }
    );

    await session.commitTransaction();
    logger.info({ userId, type }, 'Usage incremented successfully with transaction');
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error, userId, type }, 'Error incrementing usage - transaction rolled back');
    throw error;
  } finally {
    session.endSession();
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
