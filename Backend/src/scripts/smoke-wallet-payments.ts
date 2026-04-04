import mongoose from 'mongoose';
import { env } from '../config/env';

const BASE_URL = process.env.API_BASE_URL || `http://127.0.0.1:${env.PORT}`;

type TestResult = {
  name: string;
  passed: boolean;
  details?: string;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
  };
};

type WalletResponse = {
  wallet: {
    plan: 'free' | 'basic' | 'pro';
    chatCredits: number;
    imageCredits: number;
    topupCredits: number;
    topupImageCredits: number;
    totalChatsUsed: number;
    totalScansUsed: number;
  };
};

type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock?: boolean;
  packId?: string;
  packType?: 'chat' | 'scan';
  credits?: number;
};

function createMockSignature(orderId: string, paymentId: string): string {
  return `mock_signature_${orderId}_${paymentId}`;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);
  return { status: response.status, data };
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function ensureServerIsUp(): Promise<void> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`API healthcheck failed with status ${response.status}`);
  }
}

async function findWalletDoc(userId: string) {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not available');
  }

  return db.collection('wallets').findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
}

async function main(): Promise<void> {
  const results: TestResult[] = [];

  const record = (name: string, passed: boolean, details?: string) => {
    results.push({ name, passed, details });
  };

  let token = '';
  let userId = '';

  try {
    await ensureServerIsUp();
    await mongoose.connect(env.MONGODB_URI);

    const phone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

    const sendOtp = await request<{ otp?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    assert(sendOtp.status === 200, `send-otp returned ${sendOtp.status}`);
    assert(sendOtp.data.otp, 'OTP preview not available. Enable OTP_PREVIEW_ENABLED for this smoke test.');

    const verifyOtp = await request<AuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp: sendOtp.data.otp }),
    });

    assert(verifyOtp.status === 200, `verify-otp returned ${verifyOtp.status}`);
    token = verifyOtp.data.token;
    userId = verifyOtp.data.user.id;

    const walletDoc = await findWalletDoc(userId);
    assert(walletDoc, 'Wallet document was not created');
    assert(walletDoc.plan === 'free', `Expected free plan, got ${walletDoc.plan}`);
    assert(walletDoc.chatCredits === 10, `Expected 10 chat credits, got ${walletDoc.chatCredits}`);
    assert(walletDoc.imageCredits === 1, `Expected 1 image credit, got ${walletDoc.imageCredits}`);
    record('1. New user login creates free wallet', true, `userId=${userId}`);

    const walletFetch = await request<WalletResponse>('/api/user/wallet', { method: 'GET' }, token);
    assert(walletFetch.status === 200, `wallet fetch returned ${walletFetch.status}`);
    assert(walletFetch.data.wallet.plan === 'free', `Expected free wallet plan, got ${walletFetch.data.wallet.plan}`);
    assert(walletFetch.data.wallet.chatCredits === 10, `Expected 10 chats, got ${walletFetch.data.wallet.chatCredits}`);
    record('2. GET /api/user/wallet returns free wallet', true);

    const firstDeduct = await request<WalletResponse>(
      '/api/user/wallet/deduct',
      { method: 'POST', body: JSON.stringify({ type: 'chat' }) },
      token
    );
    assert(firstDeduct.status === 200, `first deduct returned ${firstDeduct.status}`);
    assert(firstDeduct.data.wallet.chatCredits === 9, `Expected 9 chats, got ${firstDeduct.data.wallet.chatCredits}`);
    record('3. First chat deduct reduces chatCredits by 1', true);

    let noCreditsResponse: { status: number; data: { error?: string; upgradeRequired?: boolean } } | null = null;
    for (let i = 0; i < 10; i++) {
      const response = await request<{ wallet?: WalletResponse['wallet']; error?: string; upgradeRequired?: boolean }>(
        '/api/user/wallet/deduct',
        { method: 'POST', body: JSON.stringify({ type: 'chat' }) },
        token
      );
      if (response.status === 402) {
        noCreditsResponse = { status: response.status, data: response.data };
        break;
      }
    }

    assert(noCreditsResponse?.status === 402, 'Expected a 402 NO_CREDITS response after exhausting chats');
    assert(noCreditsResponse.data.error === 'NO_CREDITS', `Expected NO_CREDITS, got ${noCreditsResponse.data.error}`);
    record('4. Exhausted free chats returns 402 NO_CREDITS', true);

    const subscriptionOrder = await request<PaymentOrderResponse>(
      '/api/payment/subscription-order',
      { method: 'POST', body: JSON.stringify({ tier: 'pro' }) },
      token
    );
    assert(subscriptionOrder.status === 200, `subscription-order returned ${subscriptionOrder.status}`);
    assert(subscriptionOrder.data.amount === 19900, `Expected 19900, got ${subscriptionOrder.data.amount}`);
    assert(Boolean(subscriptionOrder.data.orderId), 'Missing orderId');
    record('5. Subscription order returns expected pro pricing', true, `orderId=${subscriptionOrder.data.orderId}`);

    const paymentId = `pay_mock_${Date.now()}`;
    const verifySubscription = await request<{ success: boolean; wallet: WalletResponse['wallet'] }>(
      '/api/payment/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: subscriptionOrder.data.orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: createMockSignature(subscriptionOrder.data.orderId, paymentId),
          purpose: 'subscription',
          tier: 'pro',
        }),
      },
      token
    );

    assert(verifySubscription.status === 200, `payment verify returned ${verifySubscription.status}`);
    assert(verifySubscription.data.success === true, 'Expected verify success=true');
    assert(verifySubscription.data.wallet.plan === 'pro', `Expected pro plan, got ${verifySubscription.data.wallet.plan}`);
    assert(verifySubscription.data.wallet.chatCredits === 100, `Expected 100 chats, got ${verifySubscription.data.wallet.chatCredits}`);
    record('6. Payment verify upgrades wallet to pro', true);

    const topupOrder = await request<PaymentOrderResponse>(
      '/api/payment/topup-order',
      { method: 'POST', body: JSON.stringify({ packId: 'chat_10' }) },
      token
    );
    assert(topupOrder.status === 200, `topup-order returned ${topupOrder.status}`);

    const topupPaymentId = `pay_mock_${Date.now() + 1}`;
    const topupVerify = await request<{ success: boolean; wallet: WalletResponse['wallet'] }>(
      '/api/payment/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: topupOrder.data.orderId,
          razorpayPaymentId: topupPaymentId,
          razorpaySignature: createMockSignature(topupOrder.data.orderId, topupPaymentId),
          purpose: 'topup',
          packId: 'chat_10',
        }),
      },
      token
    );

    assert(topupVerify.status === 200, `topup verify returned ${topupVerify.status}`);
    assert(topupVerify.data.wallet.topupCredits === 10, `Expected topupCredits=10, got ${topupVerify.data.wallet.topupCredits}`);

    const deductAfterUpgrade = await request<WalletResponse>(
      '/api/user/wallet/deduct',
      { method: 'POST', body: JSON.stringify({ type: 'chat' }) },
      token
    );
    assert(deductAfterUpgrade.status === 200, `post-upgrade deduct returned ${deductAfterUpgrade.status}`);
    assert(deductAfterUpgrade.data.wallet.topupCredits === 9, `Expected topupCredits=9, got ${deductAfterUpgrade.data.wallet.topupCredits}`);
    assert(deductAfterUpgrade.data.wallet.chatCredits === 100, `Expected chatCredits to stay 100, got ${deductAfterUpgrade.data.wallet.chatCredits}`);
    record('7. After upgrade, topup credits are deducted before plan credits', true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    record('Smoke test execution', false, message);
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }

  const failed = results.filter((result) => !result.passed);
  const passedCount = results.filter((result) => result.passed).length;

  console.log('\nWallet + Payment Smoke Test\n');
  for (const result of results) {
    const prefix = result.passed ? '[PASS]' : '[FAIL]';
    console.log(`${prefix} ${result.name}${result.details ? ` - ${result.details}` : ''}`);
  }

  console.log(`\nSummary: ${passedCount}/${results.length} checks passed`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

void main();
