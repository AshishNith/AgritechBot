import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSession extends Document {
  farmerId: Types.ObjectId;
  title: string;
  status: 'active' | 'archived';
  messageCount: number;
  lastMessageAt: Date;
  metadata: {
    cropsDiscussed: string[];
    problemsSolved: string[];
    location?: string;
    season?: string;
    type: 'chat' | 'scan';
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New chat',
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      cropsDiscussed: {
        type: [String],
        default: [],
      },
      problemsSolved: {
        type: [String],
        default: [],
      },
      location: String,
      season: String,
      type: {
        type: String,
        enum: ['chat', 'scan'],
        default: 'chat',
        index: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ farmerId: 1, lastMessageAt: -1 });

export const ChatSessionModel = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
