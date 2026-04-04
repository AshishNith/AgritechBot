import { FastifyInstance } from 'fastify';
import { createSubscription, getSubscriptionStatus, testUpgrade } from '../controllers/subscriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  const registerSubscriptionApi = async (api: FastifyInstance) => {
    api.addHook('preHandler', authMiddleware);

    api.post('/subscription', createSubscription);
    api.get('/subscription/status', getSubscriptionStatus);
    api.post('/subscription/test-upgrade', testUpgrade);
  };

  await app.register(registerSubscriptionApi, { prefix: '/api' });
  await app.register(registerSubscriptionApi, { prefix: '/api/v1' });
}
