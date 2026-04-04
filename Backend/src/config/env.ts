import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DEPLOYED_AT: z.string().optional().default('N/A'),

  // Database
  MONGODB_URI: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().default(50),

  // Redis
  REDIS_ENABLED: booleanFromEnv.default(true),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // Auth
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI Providers
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),
  GEMINI_SUGGESTIONS_MODEL: z.string().default('gemini-2.5-flash-lite'),

  // Voice
  SARVAM_API_KEY: z.string().min(1),
  SARVAM_STT_URL: z.string().url(),
  SARVAM_TTS_URL: z.string().url(),
  SARVAM_STT_MODEL: z.string().default('saaras:v2.5'),
  SARVAM_TTS_MODEL: z.string().default('bulbul:v1'),
  SARVAM_TTS_SPEAKER: z.string().default('anushka'),

  // Vector DB
  RAG_ENABLED: z.coerce.boolean().default(true),
  CHROMA_URL: z.string().url().default('http://localhost:8000'),
  CHROMA_COLLECTION: z.string().default('agri_knowledge'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Cache & Queue
  CACHE_TTL: z.coerce.number().default(3600),
  QUEUE_CONCURRENCY: z.coerce.number().default(25),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  CLUSTER_WORKERS: z.coerce.number().default(0), // 0 = auto-detect CPU count
  OTP_PREVIEW_ENABLED: booleanFromEnv.default(false),
  NOTIFICATION_SEEDING_ENABLED: booleanFromEnv.default(false),

  // Payments
  PAYMENTS_ENABLED: booleanFromEnv.default(false),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  PUBLIC_WEBSITE_URL: z.string().optional().default(''),

  // Production-specific
  CORS_ORIGINS: z.string().optional().default(''),       // Comma-separated allowed origins
  LOG_LEVEL: z.string().optional().default(''),           // Override log level (debug, info, warn, error)

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Weather
  OPENWEATHER_API_KEY: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production') {
  if (!parsed.data.CORS_ORIGINS.trim()) {
    console.error('❌ CORS_ORIGINS is required in production');
    process.exit(1);
  }

  if (parsed.data.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }

  if (parsed.data.PAYMENTS_ENABLED) {
    if (!parsed.data.RAZORPAY_KEY_ID.trim() || !parsed.data.RAZORPAY_KEY_SECRET.trim()) {
      console.error('❌ RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required when PAYMENTS_ENABLED=true');
      process.exit(1);
    }

    if (!parsed.data.PUBLIC_WEBSITE_URL.trim()) {
      console.error('❌ PUBLIC_WEBSITE_URL is required when PAYMENTS_ENABLED=true');
      process.exit(1);
    }
  }

  if (parsed.data.REDIS_ENABLED && ['localhost', '127.0.0.1', '::1'].includes(parsed.data.REDIS_HOST)) {
    console.warn('⚠️ REDIS_HOST points to localhost in production. Set REDIS_ENABLED=false or provide managed Redis host.');
  }
}

export const env = parsed.data;
