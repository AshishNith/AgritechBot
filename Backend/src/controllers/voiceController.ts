import { FastifyRequest, FastifyReply } from 'fastify';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import {
  addVoiceJob,
  getVoiceQueue,
  getVoiceQueueEvents,
  isQueueAvailable,
} from '../services/queue/queue';
import { speechToText } from '../services/voice/sarvamSTT';
import { textToSpeech } from '../services/voice/sarvamTTS';
import { detectLanguage } from '../utils/languageDetector';
import { retrieveContext } from '../services/ai/ragService';
import { buildPrompt } from '../services/ai/promptEngine';
import { queryLLM } from '../services/ai/llmRouter';

/**
 * POST /api/voice/ask
 * Process a voice query: STT -> AI -> TTS
 */
export async function voiceAsk(request: FastifyRequest, reply: FastifyReply) {
  const userId = String(request.user!._id);

  // Parse multipart file upload
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: 'Audio file is required' });
  }

  // Read the stream into a buffer
  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);
  const audioBase64 = audioBuffer.toString('base64');

  // Get or extract language from fields
  const language = (data.fields as Record<string, { value?: string }>)?.language?.value;

  // Create a chat for the voice conversation
  const chat = await Chat.create({
    userId,
    title: 'Voice conversation',
    language: language || 'Hindi',
  });
  const chatId = String(chat._id);

  if (!isQueueAvailable()) {
    const sttResult = await speechToText(audioBase64, language);
    const resolvedLanguage = language || detectLanguage(sttResult.text).language;

    const ragContext = await retrieveContext(sttResult.text);
    const llmMessages = buildPrompt({
      userMessage: sttResult.text,
      language: resolvedLanguage,
      ragContext: ragContext || undefined,
    });

    const llmResponse = await queryLLM(llmMessages);
    const audioResponse = await textToSpeech(llmResponse.content, resolvedLanguage);

    await Message.insertMany([
      {
        chatId,
        userId,
        role: 'user',
        content: sttResult.text,
        language: resolvedLanguage,
      },
      {
        chatId,
        userId,
        role: 'assistant',
        content: llmResponse.content,
        language: resolvedLanguage,
        metadata: {
          model: llmResponse.model,
          ragContextUsed: !!ragContext,
          fallback: 'sync-no-redis',
        },
      },
    ]);

    await Chat.findByIdAndUpdate(chatId, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    return reply.send({
      chatId,
      text: sttResult.text,
      answer: llmResponse.content,
      audio: audioResponse,
      mode: 'sync-fallback',
    });
  }

  // Add to voice queue
  const jobId = await addVoiceJob({
    userId: userId.toString(),
    chatId,
    audioBase64,
    language,
  });

  const job = await getVoiceQueue().getJob(jobId);
  if (!job) {
    return reply.status(500).send({ error: 'Failed to process voice request' });
  }

  try {
    const result = await job.waitUntilFinished(
      getVoiceQueueEvents(),
      60_000 // 60s timeout for voice (STT + LLM + TTS)
    );
    return reply.send({ ...result, chatId });
  } catch {
    return reply.status(504).send({
      error: 'Voice processing timed out. Please try again.',
      chatId,
      jobId,
    });
  }
}
