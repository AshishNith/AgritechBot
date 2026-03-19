import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  MONGODB_URI: z.string().min(1),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  SARVAM_API_KEY: z.string().min(1),
  SARVAM_STT_URL: z.string().url(),
  SARVAM_TTS_URL: z.string().url(),

  CHROMA_URL: z.string().url().default('http://localhost:8000'),
  CHROMA_COLLECTION: z.string().default('agri_knowledge'),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  CACHE_TTL: z.coerce.number().default(3600),
  QUEUE_CONCURRENCY: z.coerce.number().default(25),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  CLUSTER_WORKERS: z.coerce.number().default(0), // 0 = auto-detect CPU count
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
