import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  audioUrl?: string;
  metadata?: {
    model?: string;
    cached?: boolean;
    ragContextUsed?: boolean;
    processingTimeMs?: number;
  };
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'Hindi',
    },
    audioUrl: String,
    metadata: {
      model: String,
      cached: Boolean,
      ragContextUsed: Boolean,
      processingTimeMs: Number,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
