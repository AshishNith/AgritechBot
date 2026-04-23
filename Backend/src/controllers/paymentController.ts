import { randomBytes } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Subscription } from '../models/Subscription';
import { PaymentAttempt } from '../models/PaymentAttempt';
import { addPlanCredits, addTopupCredits } from '../services/walletService';
import {
  createRazorpayOrder,
  paymentsEnabled,
  verifyRazorpaySignature,
} from '../services/payments/razorpay';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  calculateDraftAmount,
  createConfirmedOrderFromDraft,
  OrderDraftPayload,
} from '../services/orders/orderService';

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

const marketplaceOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
});

const verifyPaymentSchema = z
  .object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    purpose: z.enum(['subscription', 'topup', 'marketplace']),
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

function buildReceipt(prefix: 'sub' | 'topup' | 'mkt', userId: string): string {
  return `${prefix}_${Date.now()}_${userId.slice(-6)}`;
}

function createCheckoutToken(): string {
  return randomBytes(24).toString('hex');
}

function normalizeOrderDraft(input: z.infer<typeof marketplaceOrderSchema>): OrderDraftPayload {
  return {
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    deliveryAddress: {
      line1: input.deliveryAddress.line1,
      line2: input.deliveryAddress.line2,
      city: input.deliveryAddress.city,
      state: input.deliveryAddress.state,
      pincode: input.deliveryAddress.pincode,
    },
  };
}

export const processDummyPayment = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;
  const { tier } = request.body as { tier: 'free' | 'basic' | 'pro' };

  if (!['basic', 'pro'].includes(tier)) {
    return reply.status(400).send({ error: 'Invalid tier for payment' });
  }

  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: {
          tier,
          status: 'active',
          startDate: now,
          endDate,
          queriesUsed: 0,
          scansUsed: 0,
          paymentId: `DUMMY_PAY_${Date.now()}`,
        },
      },
      { upsert: true, new: true }
    );

    logger.info({ userId, tier }, 'Dummy payment processed successfully');

    let updatedWallet: any = null;
    try {
      if (tier === 'basic' || tier === 'pro') {
        updatedWallet = await addPlanCredits(userId.toString(), tier);
        logger.info({ userId, tier }, 'Wallet plan credits added via dummy payment');
      }
    } catch (walletErr) {
      logger.error({ userId, tier, err: walletErr }, 'Failed to sync wallet credits during dummy payment');
    }

    return reply.send({
      success: true,
      subscriptionTier: subscription.tier,
      expiresAt: subscription.endDate,
      wallet: updatedWallet,
    });
  } catch (error) {
    logger.error({ err: error, userId }, 'Error processing dummy payment');
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
      amount: SUBSCRIPTION_PRICES[tier],
      currency: 'INR',
      receipt: buildReceipt('sub', userId),
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
    logger.error({ err: error, userId, tier }, 'Failed to create subscription order');
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
  const pack = TOPUP_PACKS[packId];

  try {
    const order = await createRazorpayOrder({
      amount: pack.amount,
      currency: 'INR',
      receipt: buildReceipt('topup', userId),
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
    logger.error({ err: error, userId, packId }, 'Failed to create topup order');
    return reply.status(500).send({ error: 'Failed to create payment order' });
  }
}

export async function createMarketplaceOrderHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = marketplaceOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id.toString();
  const draft = normalizeOrderDraft(parsed.data);

  try {
    const draftAmount = await calculateDraftAmount(draft);
    const amountInPaise = Math.round(draftAmount * 100);

    if (amountInPaise < 100) {
      return reply.status(400).send({ error: 'Order amount must be at least Rs 1' });
    }

    const receipt = buildReceipt('mkt', userId);
    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: { userId, purpose: 'marketplace' },
    });

    await PaymentAttempt.create({
      userId,
      purpose: 'order',
      status: 'created',
      provider: 'razorpay',
      amount: order.amount,
      currency: order.currency,
      receipt,
      checkoutToken: createCheckoutToken(),
      providerOrderId: order.id,
      orderDraft: draft,
    });

    return reply.send({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      isMock: !paymentsEnabled(),
    });
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to create marketplace payment order');
    return reply.status(400).send({ error: (error as Error).message || 'Failed to create payment order' });
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
      if (purpose === 'marketplace') {
        await PaymentAttempt.findOneAndUpdate(
          { userId, purpose: 'order', providerOrderId: razorpayOrderId, status: 'created' },
          {
            $set: {
              status: 'failed',
              providerPaymentId: razorpayPaymentId,
              providerSignature: razorpaySignature,
              verificationError: 'INVALID_SIGNATURE',
            },
          }
        );
      }

      return reply.status(400).send({ error: 'INVALID_SIGNATURE' });
    }

    if (purpose === 'subscription' && tier) {
      const wallet = await addPlanCredits(userId, tier);
      return reply.send({ success: true, wallet });
    }

    if (purpose === 'topup' && packId) {
      const pack = TOPUP_PACKS[packId];
      const wallet = await addTopupCredits(userId, pack.packType, pack.credits);
      return reply.send({ success: true, wallet });
    }

    if (purpose === 'marketplace') {
      const paymentAttempt = await PaymentAttempt.findOne({
        userId,
        purpose: 'order',
        providerOrderId: razorpayOrderId,
      });

      if (!paymentAttempt) {
        return reply.status(404).send({ error: 'PAYMENT_ORDER_NOT_FOUND' });
      }

      if (paymentAttempt.status === 'verified' && paymentAttempt.orderId) {
        return reply.send({
          success: true,
          orderId: paymentAttempt.orderId.toString(),
        });
      }

      if (paymentAttempt.status !== 'created') {
        return reply.status(409).send({ error: 'PAYMENT_ORDER_NOT_ACTIVE' });
      }

      if (!paymentAttempt.orderDraft) {
        return reply.status(500).send({ error: 'ORDER_DRAFT_MISSING' });
      }

      const createdOrder = await createConfirmedOrderFromDraft({
        userId,
        draft: paymentAttempt.orderDraft,
        paymentId: razorpayPaymentId,
      });

      await PaymentAttempt.findByIdAndUpdate(paymentAttempt._id, {
        $set: {
          status: 'verified',
          providerPaymentId: razorpayPaymentId,
          providerSignature: razorpaySignature,
          verifiedAt: new Date(),
          orderId: createdOrder._id,
        },
        $unset: {
          verificationError: 1,
        },
      });

      return reply.send({
        success: true,
        orderId: createdOrder.id,
      });
    }

    return reply.status(400).send({ error: 'INVALID_PAYMENT_PURPOSE' });
  } catch (error) {
    logger.error({ err: error, userId, purpose, tier, packId }, 'Failed to verify payment');
    return reply.status(500).send({ error: 'Failed to verify payment' });
  }
}
