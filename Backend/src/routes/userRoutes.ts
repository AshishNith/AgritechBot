import { FastifyInstance } from 'fastify';
import { getProfile, createProfile, updateProfile, deleteAccount } from '../controllers/userController';
import { deductCreditHandler, getWalletHandler } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/user/profile', getProfile);
  app.post('/user/profile', createProfile);
  app.put('/user/profile', updateProfile);
  app.delete('/user/account', deleteAccount);
  app.get('/user/wallet', getWalletHandler);
  app.post('/user/wallet/deduct', deductCreditHandler);
}
