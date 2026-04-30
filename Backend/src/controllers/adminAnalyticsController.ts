import { FastifyReply, FastifyRequest } from 'fastify';
import { getDetailedAnalytics } from '../services/adminAnalyticsService';

export async function getAdminAnalytics(_request: FastifyRequest, reply: FastifyReply) {
  const analytics = await getDetailedAnalytics();
  return reply.send(analytics);
}

