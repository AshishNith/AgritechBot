import { FastifyInstance } from 'fastify';
import { CropPlanningController } from '../controllers/CropPlanningController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function cropPlannerRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    // Each plan is a paid AI call: cap it per signed-in user.
    protectedRoutes.post(
      '/generate-plan',
      {
        config: {
          rateLimit: {
            max: 10,
            timeWindow: 60 * 60 * 1000,
            keyGenerator: (request) => String(request.headers.authorization || request.ip),
          },
        },
      },
      CropPlanningController.generatePlan
    );
    protectedRoutes.get('/plans', CropPlanningController.getUserPlans);
    protectedRoutes.get('/plans/:id', CropPlanningController.getPlanById);
  }, { prefix: '/crop-planner' });
}
