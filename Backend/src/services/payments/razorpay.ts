import crypto from 'crypto';
import { env } from '../../config/env';

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

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
    throw new Error('Payments are currently unavailable');
  }

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
    const errorMessage =
      typeof data.error === 'object' && data.error && 'description' in data.error
        ? String((data.error as { description?: unknown }).description || 'Failed to create Razorpay order')
        : 'Failed to create Razorpay order';
    throw new Error(errorMessage);
  }

  return data as unknown as RazorpayOrderResponse;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
}
