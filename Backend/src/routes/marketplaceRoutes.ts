import { FastifyInstance } from 'fastify';
import {
  getProducts,
  getProductById,
  createOrder,
  getOrders,
} from '../controllers/marketplaceController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function marketplaceRoutes(app: FastifyInstance): Promise<void> {
  // Public routes
  app.get('/products', getProducts);
  app.get('/products/:id', getProductById);

  // Protected routes
  app.post('/orders', { preHandler: authMiddleware }, createOrder);
  app.get('/orders', { preHandler: authMiddleware }, getOrders);
}
