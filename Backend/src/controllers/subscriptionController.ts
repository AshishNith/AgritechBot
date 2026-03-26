import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { User } from '../models/User';
import { env } from '../config/env';

const createSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'premium']),
  paymentId: z.string().min(1),
});

/**
 * POST /api/subscription
 * Create or upgrade a subscription.
 */
export async function createSubscription(request: FastifyRequest, reply: FastifyReply) {
  if (env.PAYMENTS_ENABLED) {
    return reply.status(400).send({
      error: 'Direct subscription activation is disabled. Create and verify a payment order before activating a plan.',
    });
  }

  const parsed = createSubscriptionSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const { tier, paymentId } = parsed.data;

  const durationDays = tier === 'basic' ? 30 : 365;
  const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    {
      tier,
      status: 'active',
      startDate: new Date(),
      endDate,
      paymentId,
      features: TIER_FEATURES[tier],
    },
    { upsert: true, new: true }
  );

  // Update user's subscription tier
  await User.findByIdAndUpdate(userId, { subscriptionTier: tier });

  return reply.send({
    message: `Subscribed to ${tier} plan`,
    subscription,
  });
}

/**
 * GET /api/subscription/status
 */
export async function getSubscriptionStatus(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!._id;

  const subscription = await Subscription.findOne({ userId }).lean();
  if (!subscription) {
    return reply.send({
      tier: 'free',
      status: 'active',
      features: TIER_FEATURES.free,
    });
  }

  // Check if expired
  if (subscription.endDate < new Date() && subscription.status === 'active') {
    await Subscription.findByIdAndUpdate(subscription._id, { status: 'expired' });
    await User.findByIdAndUpdate(userId, { subscriptionTier: 'free' });
    return reply.send({
      tier: 'free',
      status: 'expired',
      features: TIER_FEATURES.free,
      previousTier: subscription.tier,
    });
  }

  return reply.send({
    tier: subscription.tier,
    status: subscription.status,
    features: subscription.features,
    subscription,
  });
}
