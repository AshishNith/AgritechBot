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
  app.addHook('preHandler', authMiddleware);

  // Crop management
  app.post('/farming-assistant/crops', addCrop);
  app.get('/farming-assistant/crops', getCrops);

  // Dashboard + sync
  app.get('/farming-assistant/dashboard', getDashboard);
  app.post('/farming-assistant/sync', syncAssistant);

  // Task management
  app.get('/farming-assistant/tasks', getTasks);
  app.patch('/farming-assistant/tasks/:taskId', updateTask);

  // Weather
  app.get('/farming-assistant/weather', getCropWeather);
}
