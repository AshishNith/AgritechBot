import { FastifyInstance } from 'fastify';
import { 
  addCrop, 
  getDashboard,
  getCrops, 
  getTasks, 
  syncAssistant,
  updateTask, 
  getCropWeather 
} from '../controllers/FarmingAssistantController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function farmingAssistantRoutes(app: FastifyInstance) {
  app.register(async (api) => {
    api.addHook('preHandler', authMiddleware);

    // Crop management
    api.post('/crops', addCrop);
    api.get('/crops', getCrops);

    // Dashboard + sync
    api.get('/dashboard', getDashboard);
    api.post('/sync', syncAssistant);

    // Task management
    api.get('/tasks', getTasks);
    api.patch('/tasks/:taskId', updateTask);

    // Weather
    api.get('/weather', getCropWeather);
    
  }, { prefix: '/api/v1/farming-assistant' });
}
