import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  paymentId?: string;
  queriesUsed: number;
  scansUsed: number;
  features: {
    chatLimit: number;
    scanLimit: number;
    voiceEnabled: boolean;
    prioritySupport: boolean;
    marketplaceAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TIER_FEATURES = {
  free: { chatLimit: 5, scanLimit: 2, voiceEnabled: false, prioritySupport: false, marketplaceAccess: true },
  basic: { chatLimit: 35, scanLimit: 5, voiceEnabled: true, prioritySupport: false, marketplaceAccess: true },
  premium: { chatLimit: 55, scanLimit: 10, voiceEnabled: true, prioritySupport: true, marketplaceAccess: true },
};

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    queriesUsed: {
      type: Number,
      default: 0,
    },
    scansUsed: {
      type: Number,
      default: 0,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    paymentId: String,
    features: {
      chatLimit: { type: Number, default: 5 },
      scanLimit: { type: Number, default: 2 },
      voiceEnabled: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      marketplaceAccess: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.pre('save', function (next) {
  if (this.isModified('tier')) {
    this.features = TIER_FEATURES[this.tier];
  }
  next();
});

export { TIER_FEATURES };
export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
