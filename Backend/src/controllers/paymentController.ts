import { randomBytes } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Subscription } from '../models/Subscription';
import { PaymentAttempt } from '../models/PaymentAttempt';
import { addPlanCredits, addTopupCredits, getWallet } from '../services/walletService';
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
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
    const receipt = buildReceipt('sub', userId);
    const order = await createRazorpayOrder({
      amount: SUBSCRIPTION_PRICES[tier],
      currency: 'INR',
      receipt,
      notes: { userId, tier },
    });

    // Record what this order is for, so verification grants exactly this plan once.
    await PaymentAttempt.create({
      userId,
      purpose: 'subscription',
      status: 'created',
      provider: 'razorpay',
      amount: order.amount,
      currency: order.currency || 'INR',
      receipt,
      checkoutToken: createCheckoutToken(),
      providerOrderId: order.id,
      subscriptionDraft: { tier },
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
    const receipt = buildReceipt('topup', userId);
    const order = await createRazorpayOrder({
      amount: pack.amount,
      currency: 'INR',
      receipt,
      notes: { userId, packId },
    });

    // Record what this order is for, so verification grants exactly this pack once.
    await PaymentAttempt.create({
      userId,
      purpose: 'topup',
      status: 'created',
      provider: 'razorpay',
      amount: order.amount,
      currency: order.currency || 'INR',
      receipt,
      checkoutToken: createCheckoutToken(),
      providerOrderId: order.id,
      topupDraft: { packId },
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

type TopupPackId = keyof typeof TOPUP_PACKS;

function isTopupPackId(value: unknown): value is TopupPackId {
  return typeof value === 'string' && value in TOPUP_PACKS;
}

/**
 * Finds the PaymentAttempt for a subscription/top-up order. Orders created before
 * attempts were recorded are rebuilt from Razorpay's own order data (its notes and
 * amount), never from what the client claims.
 */
async function findOrRecoverDigitalAttempt(params: {
  userId: string;
  purpose: 'subscription' | 'topup';
  razorpayOrderId: string;
  claimedTier?: 'basic' | 'pro';
  claimedPackId?: TopupPackId;
}) {
  const existing = await PaymentAttempt.findOne({
    providerOrderId: params.razorpayOrderId,
    userId: params.userId,
  });
  if (existing) return existing;

  let tier: 'basic' | 'pro' | undefined;
  let packId: TopupPackId | undefined;
  let amount: number;

  if (paymentsEnabled()) {
    const order = await fetchRazorpayOrder(params.razorpayOrderId);
    if (order.notes.userId !== params.userId) return null;
    if (params.purpose === 'subscription') {
      if (order.notes.tier !== 'basic' && order.notes.tier !== 'pro') return null;
      tier = order.notes.tier;
      if (order.amount !== SUBSCRIPTION_PRICES[tier]) return null;
    } else {
      if (!isTopupPackId(order.notes.packId)) return null;
      packId = order.notes.packId;
      if (order.amount !== TOPUP_PACKS[packId].amount) return null;
    }
    amount = order.amount;
  } else {
    // Local/mock mode only: no real money is involved.
    tier = params.claimedTier;
    packId = params.claimedPackId;
    if (params.purpose === 'subscription' && !tier) return null;
    if (params.purpose === 'topup' && !packId) return null;
    amount = params.purpose === 'subscription' ? SUBSCRIPTION_PRICES[tier!] : TOPUP_PACKS[packId!].amount;
  }

  return PaymentAttempt.findOneAndUpdate(
    { providerOrderId: params.razorpayOrderId },
    {
      $setOnInsert: {
        userId: params.userId,
        purpose: params.purpose,
        status: 'created',
        provider: 'razorpay',
        amount,
        currency: 'INR',
        receipt: `recovered_${params.razorpayOrderId}`,
        checkoutToken: createCheckoutToken(),
        providerOrderId: params.razorpayOrderId,
        ...(tier ? { subscriptionDraft: { tier } } : {}),
        ...(packId ? { topupDraft: { packId } } : {}),
      },
    },
    { upsert: true, new: true }
  );
}

/**
 * Grants a plan or credit pack for a verified payment. The plan/pack comes from the
 * server-side record of the order (not the request), and each order is granted once.
 */
async function grantDigitalPurchase(params: {
  reply: FastifyReply;
  userId: string;
  purpose: 'subscription' | 'topup';
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  claimedTier?: 'basic' | 'pro';
  claimedPackId?: TopupPackId;
}) {
  const { reply, userId, purpose, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const attempt = await findOrRecoverDigitalAttempt({
    userId,
    purpose,
    razorpayOrderId,
    claimedTier: params.claimedTier,
    claimedPackId: params.claimedPackId,
  });

  if (!attempt || attempt.purpose !== purpose) {
    logger.warn({ userId, purpose, razorpayOrderId }, 'Payment verify: order not found for this user/purpose');
    return reply.status(404).send({ error: 'PAYMENT_ORDER_NOT_FOUND' });
  }

  // Atomically claim the order: only the first successful verify grants anything.
  const claimed = await PaymentAttempt.findOneAndUpdate(
    { _id: attempt._id, status: 'created' },
    {
      $set: {
        status: 'verified',
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
        verifiedAt: new Date(),
      },
      $unset: { verificationError: 1 },
    },
    { new: true }
  );

  if (!claimed) {
    // Already processed. A retry of the same payment is fine; anything else is not.
    if (attempt.status === 'verified' && attempt.providerPaymentId === razorpayPaymentId) {
      const wallet = await getWallet(userId);
      return reply.send({ success: true, wallet, alreadyProcessed: true });
    }
    logger.warn({ userId, razorpayOrderId, status: attempt.status }, 'Payment verify: order already used');
    return reply.status(409).send({ error: 'PAYMENT_ORDER_NOT_ACTIVE' });
  }

  try {
    let wallet;
    if (purpose === 'subscription') {
      const tier = claimed.subscriptionDraft?.tier;
      if (!tier) throw new Error('Subscription draft missing tier');
      wallet = await addPlanCredits(userId, tier);
    } else {
      const packId = claimed.topupDraft?.packId;
      if (!isTopupPackId(packId)) throw new Error('Top-up draft missing pack');
      const pack = TOPUP_PACKS[packId];
      wallet = await addTopupCredits(userId, pack.packType, pack.credits);
    }
    logger.info({ userId, purpose, razorpayOrderId }, 'Digital purchase granted');
    return reply.send({ success: true, wallet });
  } catch (grantError) {
    // Undo the claim so the farmer can retry; they have paid.
    await PaymentAttempt.findByIdAndUpdate(claimed._id, {
      $set: { status: 'created', verificationError: 'GRANT_FAILED' },
    });
    throw grantError;
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

    if (purpose === 'subscription' || purpose === 'topup') {
      return await grantDigitalPurchase({
        reply,
        userId,
        purpose,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        claimedTier: tier,
        claimedPackId: packId,
      });
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
