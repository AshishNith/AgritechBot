import { FastifyInstance } from 'fastify';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  registerPushToken,
  unregisterPushToken,
} from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/notifications', getNotifications);
  app.get('/notifications/unread-count', getUnreadCount);
  app.put('/notifications/:id/read', markAsRead);
  app.put('/notifications/read-all', markAllRead);
  app.post('/notifications/register-token', registerPushToken);
  app.post('/notifications/unregister-token', unregisterPushToken);
}
