import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  language: string;
  messageCount: number;
  type: 'chat' | 'scan';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    language: {
      type: String,
      default: 'Hindi',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['chat', 'scan'],
      default: 'chat',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ userId: 1, updatedAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
