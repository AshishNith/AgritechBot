import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;
    const retryAfterSeconds = (error as unknown as { retryAfterSeconds?: number }).retryAfterSeconds;

    if (statusCode === 429 && typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0) {
      reply.header('Retry-After', String(retryAfterSeconds));
    }

    // Log internal server errors
    if (statusCode >= 500) {
      logger.error({
        err: error,
        reqId: request.id,
        url: request.url,
        method: request.method,
      }, 'Internal server error');
    } else {
      logger.warn({
        statusCode,
        message: error.message,
        url: request.url,
        reqId: request.id,
      }, 'Client error');
    }

    reply.status(statusCode).send({
      statusCode,
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
      requestId: request.id,
      ...(statusCode === 429 && typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0
        ? { retryAfterSeconds }
        : {}),
      ...(env.NODE_ENV !== 'production' && statusCode >= 500
        ? { stack: error.stack }
        : {}),
    });
  });

  app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Route not found',
    });
  });
}
