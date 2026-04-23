import { IWallet, PLAN_LIMITS, Wallet, WalletPlan } from '../models/Wallet';
import { logger } from '../utils/logger';

type DeductType = 'chat' | 'scan';
type PaidPlan = Exclude<WalletPlan, 'free'>;

export async function getWallet(userId: string): Promise<IWallet> {
  return Wallet.ensureForUser(userId);
}

export async function deductCredit(userId: string, type: DeductType): Promise<IWallet> {
  const wallet = await getWallet(userId);

  try {
    return await wallet.deduct(type);
  } catch (error) {
    if (error instanceof Error && error.message === 'NO_CREDITS') {
      throw { code: 'NO_CREDITS', type } as const;
    }

    throw error;
  }
}

export async function addPlanCredits(userId: string, plan: PaidPlan): Promise<IWallet> {
  await getWallet(userId);

  const now = new Date();
  const planExpiry = new Date(now);
  planExpiry.setDate(planExpiry.getDate() + 30);

  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    {
      $set: {
        plan,
        chatCredits: PLAN_LIMITS[plan].chatCredits,
        imageCredits: PLAN_LIMITS[plan].imageCredits,
        planExpiry,
        lastReset: now,
      },
    },
    { new: true }
  );

  if (!wallet) {
    throw new Error('WALLET_NOT_FOUND');
  }

  return wallet;
}

export async function addTopupCredits(
  userId: string,
  type: DeductType,
  amount: number
): Promise<IWallet> {
  await getWallet(userId);

  const field = type === 'chat' ? 'topupCredits' : 'topupImageCredits';
  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [field]: amount } },
    { new: true }
  );

  if (!wallet) {
    throw new Error('WALLET_NOT_FOUND');
  }

  return wallet;
}

export async function resetPlanCredits(userId: string): Promise<IWallet> {
  const existingWallet = await getWallet(userId);
  const limits = PLAN_LIMITS[existingWallet.plan];
  const now = new Date();

  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    {
      $set: {
        chatCredits: limits.chatCredits,
        imageCredits: limits.imageCredits,
        lastReset: now,
      },
    },
    { new: true }
  );

  if (!wallet) {
    throw new Error('WALLET_NOT_FOUND');
  }

  return wallet;
}

export async function runMonthlyReset(): Promise<{ resetCount: number }> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const wallets = await Wallet.find({
    $or: [
      { plan: 'free' },
      { plan: { $in: ['basic', 'pro'] }, planExpiry: { $gt: now } }
    ]
  });

  let resetCount = 0;

  for (const wallet of wallets) {
    const lastResetMonthStart = new Date(wallet.lastReset.getFullYear(), wallet.lastReset.getMonth(), 1);
    
    // Only reset if the current month is different from the last reset month
    if (currentMonthStart.getTime() > lastResetMonthStart.getTime()) {
      const userId = wallet.userId.toString();
      const plan = wallet.plan;
      const planLimit = PLAN_LIMITS[plan].chatCredits;
      const rolloverCredits =
        plan === 'pro'
          ? Math.min(wallet.chatCredits, Math.floor(planLimit * 0.25))
          : 0;

      const updatedWallet = await resetPlanCredits(userId);

      if (plan === 'pro' && rolloverCredits > 0) {
        updatedWallet.chatCredits = Math.min(updatedWallet.chatCredits + rolloverCredits, planLimit);
        await updatedWallet.save();
      }

      logger.info({ userId, plan }, 'Monthly credits reset (calendar month)');
      resetCount += 1;
    }
  }

  return { resetCount };
}
