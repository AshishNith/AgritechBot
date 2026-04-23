import { FastifyInstance } from 'fastify';
import {
  createMarketplaceOrderHandler,
  createSubscriptionOrderHandler,
  createTopupOrderHandler,
  verifyPaymentHandler,
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.post('/payment/marketplace-order', { preHandler: authMiddleware }, createMarketplaceOrderHandler);
  app.post('/payment/subscription-order', { preHandler: authMiddleware }, createSubscriptionOrderHandler);
  app.post('/payment/topup-order', { preHandler: authMiddleware }, createTopupOrderHandler);
  app.post('/payment/verify', { preHandler: authMiddleware }, verifyPaymentHandler);
}
