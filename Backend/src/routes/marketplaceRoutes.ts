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
  app.get('/api/products', getProducts);
  app.get('/api/products/:id', getProductById);

  // Protected routes
  app.post('/api/orders', { preHandler: authMiddleware }, createOrder);
  app.get('/api/orders', { preHandler: authMiddleware }, getOrders);
}
