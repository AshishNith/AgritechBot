import { FastifyInstance } from 'fastify';
import {
  createPaymentOrder,
  getCheckoutSession,
  getPaymentStatus,
  verifyPayment,
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/payment/orders', { preHandler: authMiddleware }, createPaymentOrder);
  app.get('/api/payment/checkout/:paymentOrderId', getCheckoutSession);
  app.get('/api/payment/status/:paymentOrderId', getPaymentStatus);
  app.post('/api/payment/verify', verifyPayment);
}
