import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AdminRole = 'admin' | 'super_admin';

export interface IAdminAccount extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const adminAccountSchema = new Schema<IAdminAccount>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

adminAccountSchema.methods.comparePassword = function comparePassword(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const AdminAccount = mongoose.model<IAdminAccount>('AdminAccount', adminAccountSchema);

