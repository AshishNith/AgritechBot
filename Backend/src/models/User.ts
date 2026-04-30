import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  phone: string;
  name?: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  language: string;
  location?: {
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  crops?: string[];
  landSize?: number;
  landUnit?: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified: boolean;
  subscriptionTier: 'free' | 'basic' | 'pro';
  usageLimits?: {
    chatCount: number;
    scanCount: number;
    lastReset: Date;
  };
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  compareOtp(candidateOtp: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\+?[1-9]\d{9,14}$/,
    },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
      index: true,
    },
    language: {
      type: String,
      default: 'Hindi',
    },
    location: {
      state: String,
      district: String,
      latitude: Number,
      longitude: Number,
      address: String,
    },
    crops: [String],
    landSize: Number,
    landUnit: String,
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    subscriptionTier: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'free',
    },
    usageLimits: {
      chatCount: { type: Number, default: 0 },
      scanCount: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('otp') || !this.otp) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

userSchema.methods.compareOtp = async function (candidateOtp: string): Promise<boolean> {
  if (!this.otp) return false;
  return bcrypt.compare(candidateOtp, this.otp);
};

export const User = mongoose.model<IUser>('User', userSchema);
