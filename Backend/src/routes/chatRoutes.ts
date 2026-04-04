import { FastifyInstance } from 'fastify';
import {
  askQuestion,
  getChatHistory,
  getChatMessages,
  streamChat,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createUsageEnforcementMiddleware } from '../middlewares/usageEnforcement.middleware';

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  const chatLimitCheck = createUsageEnforcementMiddleware('chat');
  app.addHook('preHandler', authMiddleware);

  app.post('/api/chat/ask', { preHandler: [chatLimitCheck] }, askQuestion);
  app.post('/api/chat/stream', { preHandler: [chatLimitCheck] }, streamChat);
  app.get('/api/chat/history', getChatHistory);
  app.get('/api/chat/:chatId/messages', getChatMessages);
}
