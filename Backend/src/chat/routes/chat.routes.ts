import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { chatRateLimitMiddleware } from '../middleware/chatRateLimit.middleware';
import { createUsageEnforcementMiddleware } from '../../middlewares/usageEnforcement.middleware';
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
  voiceInputController,
} from '../controllers/message.controller';

export async function chatV1Routes(app: FastifyInstance): Promise<void> {
  const chatLimitCheck = createUsageEnforcementMiddleware('chat');

  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authMiddleware);

    // Session management
    protectedApp.post('/chat/sessions', createSessionController);
    protectedApp.get('/chat/sessions', listSessionsController);
    protectedApp.get('/chat/sessions/:sessionId', getSessionController);
    protectedApp.put('/chat/sessions/:sessionId', updateSessionController);
    protectedApp.delete('/chat/sessions/:sessionId', archiveSessionController);

    // Messages
    protectedApp.get('/chat/sessions/:sessionId/messages', getSessionMessagesController);
    protectedApp.get('/chat/context', getChatContextController);
    protectedApp.delete('/chat/sessions/:sessionId/history', clearHistoryController);

    // Send message (text)
    protectedApp.post(
      '/chat/sessions/:sessionId/message',
      { preHandler: [chatRateLimitMiddleware, chatLimitCheck] },
      sendMessageController
    );

    // Send message (voice: STT → AI → TTS)
    protectedApp.post(
      '/chat/sessions/:sessionId/voice',
      { preHandler: [chatRateLimitMiddleware, chatLimitCheck] },
      sendVoiceMessageController
    );

    // STT-only: transcribe audio → return text (no AI call, no TTS)
    protectedApp.post(
      '/chat/voice-input',
      { preHandler: [chatRateLimitMiddleware] },
      voiceInputController
    );
  });
}
