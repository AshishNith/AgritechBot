import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { env } from '../config/env';
import { PaymentAttempt } from '../models/PaymentAttempt';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { createConfirmedOrderFromDraft, calculateDraftAmount } from '../services/orders/orderService';
import {
  createRazorpayOrder,
  paymentsEnabled,
  verifyRazorpaySignature,
} from '../services/payments/razorpay';

const orderDraftSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
});

const createPaymentOrderSchema = z.discriminatedUnion('purpose', [
  z.object({
    purpose: z.literal('order'),
    order: orderDraftSchema,
  }),
  z.object({
    purpose: z.literal('subscription'),
    subscription: z.object({
      tier: z.enum(['basic', 'premium']),
    }),
  }),
]);

const verifyPaymentSchema = z.object({
  paymentOrderId: z.string().min(1),
  clientToken: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const checkoutQuerySchema = z.object({
  token: z.string().min(1),
});

const SUBSCRIPTION_PRICING_PAISE = {
  basic: 39900,
  premium: 299900,
} as const;

function buildCheckoutUrl(paymentOrderId: string, token: string): string {
  const base = env.PUBLIC_WEBSITE_URL.replace(/\/$/, '');
  return `${base}/checkout/${paymentOrderId}?token=${token}`;
}

function buildCreateResponse(params: {
  paymentOrderId: string;
  checkoutToken: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  purpose: 'order' | 'subscription';
  metadata?: Record<string, unknown>;
}) {
  return {
    paymentOrderId: params.paymentOrderId,
    checkoutToken: params.checkoutToken,
    checkoutUrl: buildCheckoutUrl(params.paymentOrderId, params.checkoutToken),
    provider: 'razorpay' as const,
    providerOrderId: params.providerOrderId,
    keyId: env.RAZORPAY_KEY_ID,
    amount: params.amount,
    currency: params.currency,
    purpose: params.purpose,
    status: 'created' as const,
    metadata: params.metadata,
  };
}

async function getAttemptByAccess(params: {
  paymentOrderId: string;
  token: string;
}) {
  const attempt = await PaymentAttempt.findById(params.paymentOrderId);
  if (!attempt) {
    throw new Error('Payment order not found');
  }

  if (attempt.checkoutToken !== params.token) {
    throw new Error('Invalid payment checkout token');
  }

  return attempt;
}

export async function createPaymentOrder(request: FastifyRequest, reply: FastifyReply) {
  if (!paymentsEnabled()) {
    return reply.status(503).send({ error: 'Payments are not configured right now' });
  }

  const parsed = createPaymentOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = String(request.user!._id);
  const checkoutToken = crypto.randomBytes(24).toString('hex');
  const receipt = `anaaj_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  try {
    if (parsed.data.purpose === 'order') {
      const amountRupees = await calculateDraftAmount(parsed.data.order);
      const amount = Math.round(amountRupees * 100);

      const providerOrder = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          purpose: 'order',
          userId,
        },
      });

      const attempt = await PaymentAttempt.create({
        userId,
        purpose: 'order',
        status: 'created',
        provider: 'razorpay',
        amount: providerOrder.amount,
        currency: providerOrder.currency,
        receipt,
        checkoutToken,
        providerOrderId: providerOrder.id,
        orderDraft: parsed.data.order,
      });

      return reply.send(
        buildCreateResponse({
          paymentOrderId: String(attempt._id),
          checkoutToken,
          providerOrderId: providerOrder.id,
          amount: providerOrder.amount,
          currency: providerOrder.currency,
          purpose: 'order',
        })
      );
    }

    const tier = parsed.data.subscription.tier;
    const amount = SUBSCRIPTION_PRICING_PAISE[tier];
    const providerOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        purpose: 'subscription',
        tier,
        userId,
      },
    });

    const attempt = await PaymentAttempt.create({
      userId,
      purpose: 'subscription',
      status: 'created',
      provider: 'razorpay',
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      receipt,
      checkoutToken,
      providerOrderId: providerOrder.id,
      subscriptionDraft: {
        tier,
      },
    });

    return reply.send(
      buildCreateResponse({
        paymentOrderId: String(attempt._id),
        checkoutToken,
        providerOrderId: providerOrder.id,
        amount: providerOrder.amount,
        currency: providerOrder.currency,
        purpose: 'subscription',
        metadata: { tier },
      })
    );
  } catch (error: any) {
    logger.error({ err: error, userId }, 'Failed to create payment order');
    return reply.status(400).send({ error: error.message || 'Failed to create payment order' });
  }
}

export async function getCheckoutSession(
  request: FastifyRequest<{ Params: { paymentOrderId: string }; Querystring: { token?: string } }>,
  reply: FastifyReply
) {
  const query = checkoutQuerySchema.safeParse(request.query);
  if (!query.success) {
    return reply.status(400).send({ error: query.error.flatten().fieldErrors });
  }

  try {
    const attempt = await getAttemptByAccess({
      paymentOrderId: request.params.paymentOrderId,
      token: query.data.token,
    });

    return reply.send({
      paymentOrderId: String(attempt._id),
      provider: attempt.provider,
      keyId: env.RAZORPAY_KEY_ID,
      providerOrderId: attempt.providerOrderId,
      amount: attempt.amount,
      currency: attempt.currency,
      purpose: attempt.purpose,
      status: attempt.status,
      metadata:
        attempt.purpose === 'subscription'
          ? { tier: attempt.subscriptionDraft?.tier }
          : undefined,
    });
  } catch (error: any) {
    return reply.status(404).send({ error: error.message || 'Payment order not found' });
  }
}

export async function getPaymentStatus(
  request: FastifyRequest<{ Params: { paymentOrderId: string }; Querystring: { token?: string } }>,
  reply: FastifyReply
) {
  const query = checkoutQuerySchema.safeParse(request.query);
  if (!query.success) {
    return reply.status(400).send({ error: query.error.flatten().fieldErrors });
  }

  try {
    const attempt = await getAttemptByAccess({
      paymentOrderId: request.params.paymentOrderId,
      token: query.data.token,
    });

    return reply.send({
      paymentOrderId: String(attempt._id),
      status: attempt.status,
      purpose: attempt.purpose,
      orderId: attempt.orderId ? String(attempt.orderId) : undefined,
      subscriptionTier: attempt.subscriptionDraft?.tier,
      verifiedAt: attempt.verifiedAt,
      error: attempt.verificationError,
    });
  } catch (error: any) {
    return reply.status(404).send({ error: error.message || 'Payment status unavailable' });
  }
}

export async function verifyPayment(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyPaymentSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const {
    paymentOrderId,
    clientToken,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = parsed.data;

  try {
    const attempt = await getAttemptByAccess({
      paymentOrderId,
      token: clientToken,
    });

    if (attempt.status === 'verified') {
      return reply.send({
        status: 'verified',
        purpose: attempt.purpose,
        orderId: attempt.orderId ? String(attempt.orderId) : undefined,
        subscriptionTier: attempt.subscriptionDraft?.tier,
      });
    }

    if (attempt.providerOrderId !== razorpayOrderId) {
      attempt.status = 'failed';
      attempt.verificationError = 'Mismatched provider order id';
      await attempt.save();
      return reply.status(400).send({ error: 'Mismatched provider order id' });
    }

    const signatureValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!signatureValid) {
      attempt.status = 'failed';
      attempt.verificationError = 'Invalid Razorpay signature';
      await attempt.save();
      return reply.status(400).send({ error: 'Payment signature verification failed' });
    }

    let orderId: string | undefined;
    let subscriptionTier: 'basic' | 'premium' | undefined;

    if (attempt.purpose === 'order' && attempt.orderDraft) {
      const order = await createConfirmedOrderFromDraft({
        userId: String(attempt.userId),
        draft: {
          items: attempt.orderDraft.items,
          deliveryAddress: attempt.orderDraft.deliveryAddress,
        },
        paymentId: razorpayPaymentId,
      });

      orderId = String((order as { _id: unknown })._id);
      attempt.orderId = (order as { _id: unknown })._id as any;
    }

    if (attempt.purpose === 'subscription' && attempt.subscriptionDraft?.tier) {
      const tier = attempt.subscriptionDraft.tier;
      const durationDays = tier === 'basic' ? 30 : 365;
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      const subscription = await Subscription.findOneAndUpdate(
        { userId: attempt.userId },
        {
          tier,
          status: 'active',
          startDate: new Date(),
          endDate,
          paymentId: razorpayPaymentId,
          features: TIER_FEATURES[tier],
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(attempt.userId, { subscriptionTier: tier });

      subscriptionTier = tier;
      attempt.subscriptionId = subscription._id;
    }

    attempt.status = 'verified';
    attempt.providerPaymentId = razorpayPaymentId;
    attempt.providerSignature = razorpaySignature;
    attempt.verifiedAt = new Date();
    attempt.verificationError = undefined;
    await attempt.save();

    return reply.send({
      status: 'verified',
      purpose: attempt.purpose,
      orderId,
      subscriptionTier,
    });
  } catch (error: any) {
    logger.error({ err: error, paymentOrderId }, 'Payment verification failed');
    return reply.status(400).send({ error: error.message || 'Payment verification failed' });
  }
}
