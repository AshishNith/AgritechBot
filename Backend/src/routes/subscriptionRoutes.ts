import { FastifyInstance } from 'fastify';
import { createSubscription, getSubscriptionStatus, testUpgrade } from '../controllers/subscriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.post('/api/subscription', createSubscription);
  app.get('/api/subscription/status', getSubscriptionStatus);
  app.post('/api/subscription/test-upgrade', testUpgrade);
}
