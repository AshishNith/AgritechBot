import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const MAX_RETRIES = env.NODE_ENV === 'production' ? 5 : 1;
const RETRY_DELAY_MS = 3000;

export async function connectDB(): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
        minPoolSize: Math.min(10, env.MONGODB_MAX_POOL_SIZE),
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(
        { poolSize: env.MONGODB_MAX_POOL_SIZE, attempt },
        'MongoDB connected successfully'
      );
      break;
    } catch (error) {
      lastError = error;
      logger.error(
        { err: error, attempt, maxRetries: MAX_RETRIES },
        `MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  if (mongoose.connection.readyState !== 1) {
    logger.fatal({ err: lastError }, 'MongoDB connection failed after all retries');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnection...');
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
