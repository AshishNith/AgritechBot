import { FastifyInstance } from 'fastify';
import { voiceAsk } from '../controllers/voiceController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function voiceRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.post('/api/voice/ask', voiceAsk);
}
