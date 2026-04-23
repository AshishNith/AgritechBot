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

  app.post('/chat/ask', { preHandler: [chatLimitCheck] }, askQuestion);
  app.post('/chat/stream', { preHandler: [chatLimitCheck] }, streamChat);
  app.get('/chat/history', getChatHistory);
  app.get('/chat/:chatId/messages', getChatMessages);
}
