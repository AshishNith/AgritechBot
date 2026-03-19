import { FastifyInstance } from 'fastify';
import {
  askQuestion,
  getChatHistory,
  getChatMessages,
  streamChat,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.post('/api/chat/ask', askQuestion);
  app.post('/api/chat/stream', streamChat);
  app.get('/api/chat/history', getChatHistory);
  app.get('/api/chat/:chatId/messages', getChatMessages);
}
