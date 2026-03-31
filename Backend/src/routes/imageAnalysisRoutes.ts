import { FastifyInstance } from 'fastify';
import { analyzeCrop, getAnalysisHistory } from '../controllers/imageAnalysisController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function imageAnalysisRoutes(app: FastifyInstance) {
  app.post(
    '/api/v1/image-analysis/analyze',
    { preHandler: [authMiddleware] },
    analyzeCrop
  );

  app.get(
    '/api/v1/image-analysis/history',
    { preHandler: [authMiddleware] },
    getAnalysisHistory
  );
}
