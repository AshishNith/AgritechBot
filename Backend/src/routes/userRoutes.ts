import { FastifyInstance } from 'fastify';
import { getProfile, createProfile, updateProfile } from '../controllers/userController';
import { processDummyPayment } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/api/user/profile', getProfile);
  app.post('/api/user/profile', createProfile);
  app.put('/api/user/profile', updateProfile);
  app.post('/api/user/subscription/dummy-payment', processDummyPayment);
}
