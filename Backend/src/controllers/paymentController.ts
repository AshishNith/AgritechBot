import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Subscription } from '../models/Subscription';
import { addPlanCredits, addTopupCredits } from '../services/walletService';
import {
  createRazorpayOrder,
  paymentsEnabled,
  verifyRazorpaySignature,
} from '../services/payments/razorpay';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const subscriptionOrderSchema = z.object({
  tier: z.enum(['basic', 'pro']),
});

const TOPUP_PACKS = {
  chat_10: { amount: 4900, packType: 'chat', credits: 10 },
  chat_25: { amount: 9900, packType: 'chat', credits: 25 },
  chat_60: { amount: 19900, packType: 'chat', credits: 60 },
  scan_1: { amount: 2900, packType: 'scan', credits: 1 },
  scan_3: { amount: 6900, packType: 'scan', credits: 3 },
  scan_10: { amount: 17900, packType: 'scan', credits: 10 },
} as const;

const topupOrderSchema = z.object({
  packId: z.enum(['chat_10', 'chat_25', 'chat_60', 'scan_1', 'scan_3', 'scan_10']),
});

const verifyPaymentSchema = z
  .object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    purpose: z.enum(['subscription', 'topup']),
    tier: z.enum(['basic', 'pro']).optional(),
    packId: z
      .enum(['chat_10', 'chat_25', 'chat_60', 'scan_1', 'scan_3', 'scan_10'])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.purpose === 'subscription' && !data.tier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tier'],
        message: 'Tier is required for subscription payments',
      });
    }

    if (data.purpose === 'topup' && !data.packId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['packId'],
        message: 'Pack ID is required for topup payments',
      });
    }
  });

const SUBSCRIPTION_PRICES = {
  basic: 14900,
  pro: 19900,
} as const;

export const processDummyPayment = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;
  const { tier } = request.body as { tier: 'free' | 'basic' | 'pro' };

  if (!['basic', 'pro'].includes(tier)) {
    return reply.status(400).send({ error: 'Invalid tier for payment' });
  }

  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30); // 30-day subscription

    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: {
          tier,
          status: 'active',
          startDate: now,
          endDate: endDate,
          queriesUsed: 0,
          scansUsed: 0,
          paymentId: `DUMMY_PAY_${Date.now()}`,
        }
      },
      { upsert: true, new: true }
    );

    logger.info({ userId, tier }, 'Dummy payment processed successfully');

    // Sync to Wallet model
    try {
      if (tier === 'basic' || tier === 'pro') {
        await addPlanCredits(userId.toString(), tier);
        logger.info({ userId, tier }, 'Wallet plan credits added via dummy payment');
      }
    } catch (walletErr) {
      logger.error({ userId, tier, err: walletErr }, 'Failed to sync wallet credits during dummy payment');
    }

    return reply.send({
      success: true,
      subscriptionTier: subscription.tier,
      expiresAt: subscription.endDate,
    });
  } catch (error) {
    logger.error({ error, userId }, 'Error processing dummy payment');
    return reply.status(500).send({ error: 'Failed to process payment' });
  }
};

export async function createSubscriptionOrderHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = subscriptionOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id.toString();
  const { tier } = parsed.data;

  try {
    const order = await createRazorpayOrder({
      amount: SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES],
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: { userId, tier },
    });

    return reply.send({
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      isMock: !paymentsEnabled(),
    });
  } catch (error) {
    logger.error({ error, userId, tier }, 'Failed to create subscription order');
    return reply.status(500).send({ error: 'Failed to create payment order' });
  }
}

export async function createTopupOrderHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = topupOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id.toString();
  const { packId } = parsed.data;
  const pack = TOPUP_PACKS[packId as keyof typeof TOPUP_PACKS];

  try {
    const order = await createRazorpayOrder({
      amount: pack.amount,
      currency: 'INR',
      receipt: `topup_${userId}_${Date.now()}`,
      notes: { userId, packId },
    });

    return reply.send({
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      isMock: !paymentsEnabled(),
      packId,
      packType: pack.packType,
      credits: pack.credits,
    });
  } catch (error) {
    logger.error({ error, userId, packId }, 'Failed to create topup order');
    return reply.status(500).send({ error: 'Failed to create payment order' });
  }
}

export async function verifyPaymentHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyPaymentSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id.toString();
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    purpose,
    tier,
    packId,
  } = parsed.data;

  try {
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return reply.status(400).send({ error: 'INVALID_SIGNATURE' });
    }

    if (purpose === 'subscription' && tier) {
      const wallet = await addPlanCredits(userId, tier);
      return reply.send({ success: true, wallet });
    }

    if (purpose === 'topup' && packId) {
      const pack = TOPUP_PACKS[packId as keyof typeof TOPUP_PACKS];
      const wallet = await addTopupCredits(userId, pack.packType, pack.credits);
      return reply.send({ success: true, wallet });
    }

    return reply.status(400).send({ error: 'INVALID_PAYMENT_PURPOSE' });
  } catch (error) {
    logger.error({ error, userId, purpose, tier, packId }, 'Failed to verify payment');
    return reply.status(500).send({ error: 'Failed to verify payment' });
  }
}
