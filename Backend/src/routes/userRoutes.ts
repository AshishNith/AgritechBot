import { FastifyInstance } from 'fastify';
import { getProfile, createProfile, updateProfile } from '../controllers/userController';
import { processDummyPayment } from '../controllers/paymentController';
import { deductCreditHandler, getWalletHandler } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/api/user/profile', getProfile);
  app.post('/api/user/profile', createProfile);
  app.put('/api/user/profile', updateProfile);
  app.get('/api/user/wallet', getWalletHandler);
  app.post('/api/user/wallet/deduct', deductCreditHandler);
  app.post('/api/user/subscription/dummy-payment', processDummyPayment);
}
