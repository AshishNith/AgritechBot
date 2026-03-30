import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { chatRateLimitMiddleware } from '../middleware/chatRateLimit.middleware';
import { queryLimitCheckMiddleware } from '../middleware/queryLimitCheck.middleware';
import {
  archiveSessionController,
  createSessionController,
  getSessionController,
  listSessionsController,
  updateSessionController,
} from '../controllers/session.controller';
import {
  clearHistoryController,
  getChatContextController,
  getSessionMessagesController,
  sendMessageController,
  sendVoiceMessageController,
  streamMessageController,
  voiceInputController,
} from '../controllers/message.controller';

export async function chatV1Routes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authMiddleware);

    protectedApp.post('/api/v1/chat/sessions', createSessionController);
    protectedApp.get('/api/v1/chat/sessions', listSessionsController);
    protectedApp.get('/api/v1/chat/sessions/:sessionId', getSessionController);
    protectedApp.put('/api/v1/chat/sessions/:sessionId', updateSessionController);
    protectedApp.delete('/api/v1/chat/sessions/:sessionId', archiveSessionController);

    protectedApp.get('/api/v1/chat/sessions/:sessionId/messages', getSessionMessagesController);
    protectedApp.get('/api/v1/chat/context', getChatContextController);
    protectedApp.delete('/api/v1/chat/sessions/:sessionId/history', clearHistoryController);

    protectedApp.post(
      '/api/v1/chat/sessions/:sessionId/message',
      { preHandler: [chatRateLimitMiddleware, queryLimitCheckMiddleware] },
      sendMessageController
    );
    protectedApp.post(
      '/api/v1/chat/sessions/:sessionId/voice',
      { preHandler: [chatRateLimitMiddleware, queryLimitCheckMiddleware] },
      sendVoiceMessageController
    );
    protectedApp.post(
      '/api/v1/chat/sessions/:sessionId/message/stream',
      { preHandler: [chatRateLimitMiddleware, queryLimitCheckMiddleware] },
      streamMessageController
    );

    // STT-only: transcribe audio → return text (no AI call, no TTS)
    protectedApp.post(
      '/api/v1/chat/voice-input',
      { preHandler: [chatRateLimitMiddleware] },
      voiceInputController
    );
  });
}
