import mongoose, { Document, Schema, Types } from 'mongoose';

interface OrderDraftItem {
  productId: string;
  quantity: number;
}

interface OrderDraftAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IPaymentAttempt extends Document {
  userId: Types.ObjectId;
  purpose: 'order' | 'subscription';
  status: 'created' | 'verified' | 'failed' | 'expired';
  provider: 'razorpay';
  amount: number;
  currency: string;
  receipt: string;
  checkoutToken: string;
  providerOrderId: string;
  providerPaymentId?: string;
  providerSignature?: string;
  orderDraft?: {
    items: OrderDraftItem[];
    deliveryAddress: OrderDraftAddress;
  };
  subscriptionDraft?: {
    tier: 'basic' | 'pro';
  };
  orderId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  verificationError?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['order', 'subscription'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['created', 'verified', 'failed', 'expired'],
      default: 'created',
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: 'INR' },
    receipt: { type: String, required: true, unique: true },
    checkoutToken: { type: String, required: true, index: true },
    providerOrderId: { type: String, required: true, unique: true, index: true },
    providerPaymentId: { type: String, index: true },
    providerSignature: String,
    orderDraft: {
      items: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      deliveryAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
      },
    },
    subscriptionDraft: {
      tier: {
        type: String,
        enum: ['basic', 'pro'],
      },
    },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    verificationError: String,
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const PaymentAttempt = mongoose.model<IPaymentAttempt>('PaymentAttempt', paymentAttemptSchema);
