import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';
import {
  getAdminDashboardOverview,
  getAdminLegacyStats,
  getAdminQueuesHealth
} from '../controllers/adminDashboardController';
import {
  deleteAdminUser,
  getAdminUserById,
  listAdminUsers,
  updateAdminUserStatus
} from '../controllers/adminUserController';
import { createAdminCrop, deleteAdminCrop, listAdminCrops, updateAdminCrop } from '../controllers/adminCropController';
import { listAdminPlans, markPlanFeedback, regeneratePlan } from '../controllers/adminPlanController';
import { getAdminAnalytics } from '../controllers/adminAnalyticsController';
import { sendAdminNotification } from '../controllers/adminNotificationController';
import { listAdminLogs } from '../controllers/adminLogController';
import { createAdminLog } from '../services/adminLogService';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', adminAuthMiddleware);

  app.addHook('onRequest', async (request) => {
    (request as FastifyRequest & { __adminStart?: number }).__adminStart = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    const startedAt = (request as FastifyRequest & { __adminStart?: number }).__adminStart ?? Date.now();
    const tokenHeader = request.headers['x-token-usage'];
    const parsedTokens = typeof tokenHeader === 'string' ? Number(tokenHeader) : 0;
    const tokens = Number.isFinite(parsedTokens) ? parsedTokens : 0;

    await createAdminLog('api', `${request.method} ${request.url}`, {
      statusCode: reply.statusCode,
      durationMs: Date.now() - startedAt,
      adminId: request.adminUser ? String(request.adminUser._id) : null,
      tokens
    });
  });

  app.get('/admin/dashboard/overview', getAdminDashboardOverview);
  app.get('/admin/stats', getAdminLegacyStats);
  app.get('/admin/queues', getAdminQueuesHealth);

  app.get('/admin/users', listAdminUsers);
  app.get('/admin/users/:userId', getAdminUserById);
  app.patch('/admin/users/:userId/status', updateAdminUserStatus);
  app.delete('/admin/users/:userId', deleteAdminUser);

  app.get('/admin/crops', listAdminCrops);
  app.post('/admin/crops', createAdminCrop);
  app.put('/admin/crops/:cropId', updateAdminCrop);
  app.delete('/admin/crops/:cropId', deleteAdminCrop);

  app.get('/admin/plans', listAdminPlans);
  app.patch('/admin/plans/:planId/feedback', markPlanFeedback);
  app.post('/admin/plans/:planId/regenerate', regeneratePlan);

  app.get('/admin/analytics', getAdminAnalytics);
  app.post('/admin/notifications/send', sendAdminNotification);
  app.get('/admin/logs', listAdminLogs);
}
