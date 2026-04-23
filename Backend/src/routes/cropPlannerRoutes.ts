import { FastifyInstance } from 'fastify';
import { CropPlanningController } from '../controllers/CropPlanningController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function cropPlannerRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    protectedRoutes.post('/generate-plan', CropPlanningController.generatePlan);
    protectedRoutes.get('/plans', CropPlanningController.getUserPlans);
    protectedRoutes.get('/plans/:id', CropPlanningController.getPlanById);
  }, { prefix: '/crop-planner' });
}
