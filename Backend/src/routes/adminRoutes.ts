import { FastifyInstance } from 'fastify';
import { getStats, listUsers, getQueuesHealth } from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/authMiddleware';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const adminOnly = { preHandler: adminMiddleware };

  app.get('/admin/stats', adminOnly, getStats);
  app.get('/admin/users', adminOnly, listUsers);
  app.get('/admin/queues', adminOnly, getQueuesHealth);
}
