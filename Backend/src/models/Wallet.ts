import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export const PLAN_LIMITS = {
  free: { chatCredits: 10, imageCredits: 1, topupAllowed: false, rolloverDays: 0 },
  basic: { chatCredits: 50, imageCredits: 3, topupAllowed: true, rolloverDays: 0 },
  pro: { chatCredits: 100, imageCredits: 10, topupAllowed: true, rolloverDays: 7 },
} as const;

export type WalletPlan = keyof typeof PLAN_LIMITS;
export type DeductType = 'chat' | 'scan';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  chatCredits: number;
  imageCredits: number;
  topupCredits: number;
  topupImageCredits: number;
  plan: WalletPlan;
  planExpiry: Date | null;
  razorpaySubId?: string;
  totalChatsUsed: number;
  totalScansUsed: number;
  lastReset: Date;
  deduct(type: DeductType): Promise<IWallet>;
}

interface IWalletModel extends Model<IWallet> {
  ensureForUser(userId: Types.ObjectId | string): Promise<IWallet>;
}

const walletSchema = new Schema<IWallet, IWalletModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    chatCredits: {
      type: Number,
      default: PLAN_LIMITS.free.chatCredits,
    },
    imageCredits: {
      type: Number,
      default: PLAN_LIMITS.free.imageCredits,
    },
    topupCredits: {
      type: Number,
      default: 0,
    },
    topupImageCredits: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'free',
    },
    planExpiry: {
      type: Date,
      default: null,
    },
    razorpaySubId: {
      type: String,
    },
    totalChatsUsed: {
      type: Number,
      default: 0,
    },
    totalScansUsed: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.statics.ensureForUser = async function (
  userId: Types.ObjectId | string
): Promise<IWallet> {
  return this.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        chatCredits: PLAN_LIMITS.free.chatCredits,
        imageCredits: PLAN_LIMITS.free.imageCredits,
        topupCredits: 0,
        topupImageCredits: 0,
        plan: 'free',
        planExpiry: null,
        totalChatsUsed: 0,
        totalScansUsed: 0,
        lastReset: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).exec();
};

walletSchema.methods.deduct = async function (
  this: IWallet,
  type: DeductType
): Promise<IWallet> {
  if (type === 'chat') {
    if (this.topupCredits > 0) {
      this.topupCredits -= 1;
    } else if (this.chatCredits > 0) {
      this.chatCredits -= 1;
    } else {
      throw new Error('NO_CREDITS');
    }

    this.totalChatsUsed += 1;
  } else {
    if (this.topupImageCredits > 0) {
      this.topupImageCredits -= 1;
    } else if (this.imageCredits > 0) {
      this.imageCredits -= 1;
    } else {
      throw new Error('NO_CREDITS');
    }

    this.totalScansUsed += 1;
  }

  await this.save();
  return this;
};

export const Wallet = mongoose.model<IWallet, IWalletModel>('Wallet', walletSchema);
