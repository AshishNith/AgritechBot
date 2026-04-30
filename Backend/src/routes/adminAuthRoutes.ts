import { FastifyInstance } from 'fastify';
import { adminLogin, adminMe } from '../controllers/adminAuthController';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

export async function adminAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/admin-auth/login', adminLogin);
  app.get('/admin-auth/me', { preHandler: adminAuthMiddleware }, adminMe);
}

