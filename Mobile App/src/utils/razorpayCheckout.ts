import RazorpayCheckout from 'react-native-razorpay';
import { CreatePaymentOrderResponse } from '../types/api';

type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

export type RazorpayCheckoutResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function readErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'Payment was cancelled.';
  }

  if ('description' in error && typeof error.description === 'string') {
    return error.description;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Payment was cancelled.';
}

export async function openRazorpayCheckout(params: {
  order: CreatePaymentOrderResponse;
  description: string;
  prefill?: RazorpayPrefill;
}): Promise<RazorpayCheckoutResult> {
  if (params.order.isMock) {
    const mockPaymentId = `pay_mock_${Date.now()}`;
    return {
      razorpay_order_id: params.order.orderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: `mock_signature_${params.order.orderId}_${mockPaymentId}`,
    };
  }

  const result = await RazorpayCheckout.open({
    key: params.order.keyId,
    amount: params.order.amount,
    currency: params.order.currency,
    order_id: params.order.orderId,
    name: 'Anaaj AI',
    description: params.description,
    prefill: params.prefill,
    theme: { color: '#0d5c35' },
  }).catch((error: unknown) => {
    throw new Error(readErrorMessage(error));
  });

  return result;
}
