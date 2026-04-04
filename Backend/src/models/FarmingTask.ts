import mongoose, { Schema, Document } from 'mongoose';

export type TaskType = 'watering' | 'fertilizing' | 'pesticide' | 'weeding' | 'harvesting' | 'maintenance';
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'missed';

export interface IFarmingTask extends Document {
  userCropId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  taskType: TaskType;
  title: string;
  description: string;
  scheduledDate: Date;
  completedAt?: Date;
  status: TaskStatus;
  aiReason?: string;
  isManual: boolean;
  source: 'ai' | 'manual' | 'adaptive';
  priority: 'low' | 'medium' | 'high';
  reminderMinutesBefore: number;
  repeat: 'none' | 'daily' | 'weekly';
  lastAdaptiveUpdateAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const farmingTaskSchema = new Schema<IFarmingTask>(
  {
    userCropId: {
      type: Schema.Types.ObjectId,
      ref: 'UserCrop',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskType: {
      type: String,
      enum: ['watering', 'fertilizing', 'pesticide', 'weeding', 'harvesting', 'maintenance'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped', 'missed'],
      default: 'pending',
    },
    aiReason: { type: String },
    isManual: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ['ai', 'manual', 'adaptive'],
      default: 'ai',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    reminderMinutesBefore: { type: Number, default: 30 },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none',
    },
    lastAdaptiveUpdateAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

farmingTaskSchema.index({ userId: 1, scheduledDate: 1 });
farmingTaskSchema.index({ status: 1 });

export const FarmingTask = mongoose.model<IFarmingTask>('FarmingTask', farmingTaskSchema);
