import { FastifyInstance } from 'fastify';
import { getProfile, createProfile, updateProfile } from '../controllers/userController';
import { processDummyPayment } from '../controllers/paymentController';
import { deductCreditHandler, getWalletHandler } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/user/profile', getProfile);
  app.post('/user/profile', createProfile);
  app.put('/user/profile', updateProfile);
  app.get('/user/wallet', getWalletHandler);
  app.post('/user/wallet/deduct', deductCreditHandler);
  app.post('/user/subscription/dummy-payment', processDummyPayment);
}
