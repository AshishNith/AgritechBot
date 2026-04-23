import { FastifyInstance } from 'fastify';
import { createSubscription, getSubscriptionStatus, testUpgrade } from '../controllers/subscriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.post('/subscription', createSubscription);
  app.get('/subscription/status', getSubscriptionStatus);
  app.post('/subscription/test-upgrade', testUpgrade);
}
