import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { registerRateLimiter } from './middlewares/rateLimiter';
import { registerErrorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { chatRoutes } from './routes/chatRoutes';
import { voiceRoutes } from './routes/voiceRoutes';
import { userRoutes } from './routes/userRoutes';
import { marketplaceRoutes } from './routes/marketplaceRoutes';
import { subscriptionRoutes } from './routes/subscriptionRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { logger } from './utils/logger';
import { redis } from './config/redis';
import { workerMetrics } from './services/queue/worker';
import { getQueueHealth } from './services/queue/queue';
import { cache } from './services/cache/redisCache';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // We use our own pino logger
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB for voice uploads
    requestTimeout: 60_000,
    // ── Performance for 10k concurrent connections ──
    connectionTimeout: 10_000,
    keepAliveTimeout: 72_000,
  });

  // ── Plugins ──
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // ── Rate Limiter ──
  await registerRateLimiter(app);

  // ── Error Handler ──
  registerErrorHandler(app);

  // ── Health Check (extended with Redis + worker metrics) ──
  app.get('/health', async () => {
    const redisStatus = redis.status === 'ready' ? 'ok' : redis.status;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: redisStatus,
      workers: {
        chatProcessed: workerMetrics.chatProcessed,
        chatCacheHits: workerMetrics.chatCacheHits,
        voiceProcessed: workerMetrics.voiceProcessed,
        avgChatMs: workerMetrics.avgChatMs,
        avgVoiceMs: workerMetrics.avgVoiceMs,
      },
    };
  });

  // ── Metrics Endpoint (for load testing + monitoring dashboards) ──
  app.get('/metrics', async () => {
    const [queueHealth, cacheStats] = await Promise.all([
      getQueueHealth(),
      cache.getStats(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      redis: cacheStats,
      queues: queueHealth,
      workers: {
        chatProcessed: workerMetrics.chatProcessed,
        chatFailed: workerMetrics.chatFailed,
        chatCacheHits: workerMetrics.chatCacheHits,
        voiceProcessed: workerMetrics.voiceProcessed,
        voiceFailed: workerMetrics.voiceFailed,
        avgChatMs: workerMetrics.avgChatMs,
        avgVoiceMs: workerMetrics.avgVoiceMs,
      },
    };
  });

  // ── Routes ──
  await app.register(authRoutes);
  await app.register(chatRoutes);
  await app.register(voiceRoutes);
  await app.register(userRoutes);
  await app.register(marketplaceRoutes);
  await app.register(subscriptionRoutes);
  await app.register(adminRoutes);

  logger.info('All routes registered');

  return app;
}
