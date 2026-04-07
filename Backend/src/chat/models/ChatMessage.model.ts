import mongoose, { Document, Schema, Types } from 'mongoose';

type ChatContentType = 'text' | 'image' | 'tool_call' | 'tool_result';
type ChatRole = 'user' | 'assistant' | 'system';

export interface IChatMessage extends Document {
  sessionId: Types.ObjectId;
  farmerId: Types.ObjectId;
  role: ChatRole;
  content: {
    type: ChatContentType;
    text?: string;
    imageUrl?: string;
    toolName?: string;
    toolInput?: Record<string, unknown>;
    toolOutput?: Record<string, unknown>;
  };
  metadata: {
    inputTokens?: number;
    outputTokens?: number;
    processingTimeMs?: number;
    modelVersion?: string;
    cacheHit?: boolean;
    language?: 'hi' | 'en' | 'gu' | 'pa';
    audioBase64?: string;
    audioMimeType?: string;
    voiceInput?: boolean;
  };
  error?: {
    code?: string;
    message: string;
  };
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: {
        type: String,
        enum: ['text', 'image', 'tool_call', 'tool_result'],
        default: 'text',
      },
      text: String,
      imageUrl: String,
      toolName: String,
      toolInput: Schema.Types.Mixed,
      toolOutput: Schema.Types.Mixed,
    },
    metadata: {
      inputTokens: Number,
      outputTokens: Number,
      processingTimeMs: Number,
      modelVersion: String,
      cacheHit: Boolean,
      language: {
        type: String,
        enum: ['hi', 'en', 'gu', 'pa'],
      },
      audioBase64: String,
      audioMimeType: String,
      voiceInput: Boolean,
    },
    error: {
      code: String,
      message: String,
    },
    // Idempotency key to prevent duplicate messages on retries
    idempotencyKey: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ farmerId: 1, createdAt: -1 });
// Sparse index for idempotency - allows efficient lookup but doesn't enforce uniqueness
// (uniqueness is handled by checking before insert if needed)
chatMessageSchema.index({ sessionId: 1, idempotencyKey: 1 }, { sparse: true });

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
