import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';
const MOCK_ORDER_PREFIX = 'order_mock_';
const MOCK_SIGNATURE_PREFIX = 'mock_signature_';

interface CreateRazorpayOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

function isMockRazorpayOrder(orderId: string): boolean {
  return orderId.startsWith(MOCK_ORDER_PREFIX);
}

function getAuthHeader(): string {
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${auth}`;
}

export function paymentsEnabled(): boolean {
  return env.PAYMENTS_ENABLED;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResponse> {
  if (!paymentsEnabled()) {
    return {
      id: `${MOCK_ORDER_PREFIX}${Date.now()}`,
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      status: 'created',
    };
  }

  logger.info({ input }, 'Creating Razorpay order');

  const response = await fetch(RAZORPAY_ORDERS_URL, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    logger.error({ razorpayError: data, status: response.status }, 'Razorpay order creation failed');
    const errorMessage =
      typeof data.error === 'object' && data.error && 'description' in data.error
        ? String((data.error as { description?: unknown }).description || 'Failed to create Razorpay order')
        : 'Failed to create Razorpay order';
    throw new Error(errorMessage);
  }

  return data as unknown as RazorpayOrderResponse;
}

export interface RazorpayOrderDetails {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  status: string;
  notes: Record<string, string>;
}

/** Reads an order from Razorpay (server-side source of truth for amount and notes). */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrderDetails> {
  const response = await fetch(`${RAZORPAY_ORDERS_URL}/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: getAuthHeader() },
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    logger.error({ razorpayError: data, status: response.status, orderId }, 'Razorpay order lookup failed');
    throw new Error('Failed to look up Razorpay order');
  }
  const notes = (data.notes && typeof data.notes === 'object' ? data.notes : {}) as Record<string, string>;
  return {
    id: String(data.id),
    amount: Number(data.amount),
    amount_paid: Number(data.amount_paid ?? 0),
    currency: String(data.currency ?? 'INR'),
    status: String(data.status ?? ''),
    notes,
  };
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (isMockRazorpayOrder(params.orderId)) {
    // Mock orders exist only for local testing. With live payments on, a mock
    // order id is never genuine, so it must never verify.
    if (paymentsEnabled()) return false;
    return params.signature === `${MOCK_SIGNATURE_PREFIX}${params.orderId}_${params.paymentId}`;
  }

  const expected = Buffer.from(
    crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex')
  );
  const received = Buffer.from(params.signature);

  // timingSafeEqual throws on different lengths; treat that as a bad signature.
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function createMockRazorpaySignature(orderId: string, paymentId: string): string {
  return `${MOCK_SIGNATURE_PREFIX}${orderId}_${paymentId}`;
}
