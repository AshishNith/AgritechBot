import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { connectRedis, disconnectRedis } from './config/redis';
import { buildApp } from './app';
import { startWorkers } from './services/queue/worker';
import { addRepeatableWeatherJob } from './services/queue/queue';
import { logger } from './utils/logger';
import { initializeKnowledgeBaseCache } from './chat/services/knowledgeBase.service';

async function main(): Promise<void> {
  // Connect to databases
  await connectDB();
  let redisConnected = false;
  
  // Attempt Redis connection (optional in development)
  if (env.REDIS_ENABLED) {
    try {
      await connectRedis();
      redisConnected = true;
    } catch (err) {
      logger.warn({ err }, 'Redis connection failed. Queue/cache features unavailable, but core API will work.');
      // We do NOT throw here in production anymore to allow graceful degradation.
      // The server will still bind to Render's PORT and serve Auth/Healthcheck endpoints.
    }
  } else {
    logger.info('Redis disabled via REDIS_ENABLED=false. Queue/cache features are disabled.');
  }

  // Start queue workers only when Redis is available
  if (redisConnected) {
    startWorkers();
    void addRepeatableWeatherJob().catch((err) => {
      logger.error({ err }, 'Failed to schedule repeatable weather job');
    });
  } else {
    logger.info('Skipping queue worker startup because Redis is unavailable');
  }

  // Build and start Fastify
  const app = await buildApp();

  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info(`Server running on http://${env.HOST}:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  void initializeKnowledgeBaseCache().catch((err) => {
    logger.warn({ err }, 'Knowledge base cache warmup failed after server startup');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    await app.close();
    await disconnectDB();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
