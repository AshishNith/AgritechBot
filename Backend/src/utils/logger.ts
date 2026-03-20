import pino from 'pino';
import os from 'node:os';
import { env } from '../config/env';

function resolveLogLevel(): string {
  if (env.LOG_LEVEL) return env.LOG_LEVEL;
  return env.NODE_ENV === 'production' ? 'info' : 'debug';
}

export const logger = pino({
  level: resolveLogLevel(),
  transport:
    env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
  base: {
    service: 'anaaj-ai-backend',
    pid: process.pid,
    hostname: os.hostname(),
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // Redact sensitive fields from logs
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '***',
  },
});
