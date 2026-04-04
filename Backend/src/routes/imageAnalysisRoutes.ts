import { FastifyInstance } from 'fastify';
import { analyzeCrop, getAnalysisHistory } from '../controllers/imageAnalysisController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createUsageEnforcementMiddleware } from '../middlewares/usageEnforcement.middleware';

export async function imageAnalysisRoutes(app: FastifyInstance) {
  const scanLimitCheck = createUsageEnforcementMiddleware('scan');

  app.post(
    '/api/v1/image-analysis/analyze',
    { preHandler: [authMiddleware, scanLimitCheck] },
    analyzeCrop
  );

  app.get(
    '/api/v1/image-analysis/history',
    { preHandler: [authMiddleware] },
    getAnalysisHistory
  );
}
