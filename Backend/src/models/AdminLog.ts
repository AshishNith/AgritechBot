import mongoose, { Document, Schema } from 'mongoose';

export type AdminLogType = 'api' | 'error' | 'ai_failure' | 'notification' | 'system';

export interface IAdminLog extends Document {
  type: AdminLogType;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

const adminLogSchema = new Schema<IAdminLog>(
  {
    type: {
      type: String,
      enum: ['api', 'error', 'ai_failure', 'notification', 'system'],
      required: true
    },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now, index: true },
    meta: { type: Schema.Types.Mixed }
  },
  { versionKey: false }
);

adminLogSchema.index({ type: 1, timestamp: -1 });

export const AdminLog = mongoose.model<IAdminLog>('AdminLog', adminLogSchema);

