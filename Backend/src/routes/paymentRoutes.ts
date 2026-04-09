import { FastifyInstance } from 'fastify';
import {
  createMarketplaceOrderHandler,
  createSubscriptionOrderHandler,
  createTopupOrderHandler,
  verifyPaymentHandler,
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/payment/marketplace-order', { preHandler: authMiddleware }, createMarketplaceOrderHandler);
  app.post('/api/payment/subscription-order', { preHandler: authMiddleware }, createSubscriptionOrderHandler);
  app.post('/api/payment/topup-order', { preHandler: authMiddleware }, createTopupOrderHandler);
  app.post('/api/payment/verify', { preHandler: authMiddleware }, verifyPaymentHandler);
}
