import { FastifyReply, FastifyRequest } from 'fastify';
import { getDashboardOverview } from '../services/adminAnalyticsService';
import { getQueueHealth } from '../services/queue/queue';
import { redis } from '../config/redis';

export async function getAdminDashboardOverview(_request: FastifyRequest, reply: FastifyReply) {
  const overview = await getDashboardOverview();
  return reply.send(overview);
}

export async function getAdminLegacyStats(_request: FastifyRequest, reply: FastifyReply) {
  const overview = await getDashboardOverview();
  return reply.send({
    totalUsers: overview.metrics.totalUsers,
    activeUsers24h: overview.metrics.activeUsers24h,
    activeUsers7d: overview.metrics.activeUsers7d,
    totalPlans: overview.metrics.totalPlans,
    errorRate: overview.metrics.errorRate
  });
}

export async function getAdminQueuesHealth(_request: FastifyRequest, reply: FastifyReply) {
  const [queues, redisInfo] = await Promise.all([
    getQueueHealth(),
    redis.info('memory').then((info) => {
      const match = info.match(/used_memory_human:(.+)/);
      return match ? match[1].trim() : 'unknown';
    })
  ]);

  return reply.send({
    queues,
    redis: {
      status: redis.status,
      memoryUsage: redisInfo
    }
  });
}

