/**
 * geminiChat.service.ts — Clean rewrite of the core Gemini chat service.
 *
 * KEY DESIGN PRINCIPLES:
 *   1. Respond FIRST, persist AFTER — The HTTP response is sent as soon as the AI
 *      responds. DB writes and TTS are non-critical background work.
 *   2. No error persistence — Failed exchanges are NOT saved to the DB. Error
 *      messages are transient UI feedback; saving them caused duplicate messages.
 *   3. Typed errors — All thrown errors are HttpError instances so the error
 *      handler preserves user-friendly messages.
 *   4. TTS timeout — TTS is capped at 10 seconds so it can never block the response.
 *   5. Tool loop safety — The tool call loop has a hard cap of 5 iterations.
 */

import crypto from 'crypto';
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, GoogleGenerativeAIResponseError, Content, Part } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { HttpError } from '../utils/httpError';

// Services
import { textToSpeech } from '../../services/voice/sarvamTTS';
import { speechToText } from '../../services/voice/sarvamSTT';
import { ChatHistoryCache, type LeanChatMessage } from './chatHistoryCache.service';
import { getFarmerContext } from './contextBuilder.service';
import { getKnowledgeBaseCacheName } from './knowledgeBase.service';
import { touchChatSession } from './sessionManager.service';
import { getQuickSuggestions, type QuerySuggestion } from './querySuggestions.service';
import { summarizeConversationHistory } from './historyCompressor.service';
import { truncateConversationToBudget } from '../utils/contextTruncator';
import { deductCredit, getWallet } from '../../services/walletService';
import { incrementUsage } from '../../services/subscriptionService';

// Chat tools
import { TOOL_DEFINITIONS, TOOL_CONFIG, executeTool } from '../tools';


// Models
import { ChatMessageModel } from '../models/ChatMessage.model';

// Data
import { SYSTEM_PROMPT } from '../data/systemPrompt';

// Utils
import { detectChatLanguage, toUserLanguage, type ChatLanguage } from '../utils/languageDetector';

// ── Configuration ──

const GEMINI_API_TIMEOUT_MS = 20_000;     // 20s per AI call (budget: 20s × 3 calls max = 60s)
const TTS_TIMEOUT_MS = 5_000;             // 5s cap for TTS (non-critical, can fail gracefully)
const MAX_TOOL_LOOPS = 2;                 // max 2 tool iterations to keep total time under 65s
const HISTORY_TOKEN_BUDGET = 12_000;      // token budget for context window

const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// ── Quota cooldown ──

let quotaBlockedUntil = 0;

// ── Helper: Promise timeout ──

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((value) => { clearTimeout(timer); resolve(value); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

// ── Helper: Map language label → ChatLanguage code ──

function getLanguageCode(language?: string): ChatLanguage {
  const map: Record<string, ChatLanguage> = {
    'Hindi': 'hi', 'English': 'en', 'Gujarati': 'gu', 'Punjabi': 'pa',
  };
  return map[language || ''] || 'en';
}

function getLanguageLabel(code: ChatLanguage): string {
  return toUserLanguage(code);
}

// ── Helper: Friendly error messages per language ──

const friendlyErrors: Record<string, Record<ChatLanguage, string>> = {
  timeout: {
    en: 'The AI is taking too long. Please try again.',
    hi: 'AI को जवाब देने में समय लग रहा है। कृपया पुनः प्रयास करें।',
    gu: 'AI ને જવાબ આપવામાં સમય લાગી રહ્યો છે. કૃપા કરીને ફરી પ્રયાસ કરો.',
    pa: 'AI ਨੂੰ ਜਵਾਬ ਦੇਣ ਵਿੱਚ ਸਮਾਂ ਲੱਗ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  safety: {
    en: 'Your message was blocked by safety filters. Please rephrase.',
    hi: 'आपका संदेश सुरक्षा फ़िल्टर द्वारा ब्लॉक किया गया। कृपया दोबारा लिखें.',
    gu: 'તમારો સંદેશ સુરક્ષા ફિલ્ટર દ્વારા બ્લોક કરવામાં આવ્યો. કૃપા કરીને ફરી લખો.',
    pa: 'ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਸੁਰੱਖਿਆ ਫਿਲਟਰ ਦੁਆਰਾ ਬਲੌਕ ਕੀਤਾ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਲਿਖੋ।',
  },
  provider_error: {
    en: 'Something went wrong. Please try again in a moment.',
    hi: 'कुछ गड़बड़ हो गई। कृपया कुछ देर बाद पुनः प्रयास करें।',
    gu: 'કંઈક ખોટું થયું. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.',
    pa: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  provider_unavailable: {
    en: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
    hi: 'AI सेवा अस्थायी रूप से अनुपलब्ध है। कृपया कुछ मिनटों बाद पुनः प्रयास करें।',
    gu: 'AI સેવા અસ્થાયી રૂપે ઉપલબ્ધ નથી. કૃપા કરીને થોડી મિનિટો પછી ફરી પ્રયાસ કરો.',
    pa: 'AI ਸੇਵਾ ਅਸਥਾਈ ਤੌਰ \'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਕੁਝ ਮਿੰਟਾਂ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
};

function getFriendlyError(code: string, lang: ChatLanguage): string {
  return friendlyErrors[code]?.[lang] || friendlyErrors.provider_error[lang];
}

// ── Error classifiers ──

function isQuotaError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError && error.status === 429) return true;
  if (error instanceof Error && /quota|rate.?limit|resource.?exhausted/i.test(error.message)) return true;
  return false;
}

function isTemporaryProviderError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return [500, 502, 503].includes(error.status ?? 0);
  }
  return false;
}

function parseRetryDelayMs(error: unknown): number {
  const match = error instanceof Error && error.message.match(/(\d+)\s*s/);
  const parsed = match ? Number(match[1]) * 1000 : 10_000; // default 10s (was 60s — way too long)
  return Math.min(parsed, 15_000); // cap at 15s — never block longer than this
}

function getQuotaExceededMessage(lang: ChatLanguage, retryAfterSeconds: number): string {
  const messages: Record<ChatLanguage, string> = {
    en: `AI is busy. Please try again in ${retryAfterSeconds} seconds.`,
    hi: `AI व्यस्त है। कृपया ${retryAfterSeconds} सेकंड बाद पुनः प्रयास करें।`,
    gu: `AI વ્યસ્ત છે. કૃપા કરીને ${retryAfterSeconds} સેકન્ડ પછી ફરી પ્રયાસ કરો.`,
    pa: `AI ਵਿਅਸਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ${retryAfterSeconds} ਸਕਿੰਟ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
  };
  return messages[lang];
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API: sendChatMessage
// ══════════════════════════════════════════════════════════════════════════════

export interface ChatMessageResult {
  response: string;
  chatId: string;
  audioBase64?: string;
  audioMimeType?: string;
  quickReplies?: string[];
  recommendedProducts?: any[];
  model?: string;
  cached?: boolean;
  wallet?: any;
}

export async function sendChatMessage(params: {
  farmerId: string;
  sessionId: string;
  text: string;
  preferredLanguage?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<ChatMessageResult> {
  const startedAt = Date.now();

  // ── 1. Pre-flight: quota cooldown check ──
  // Only block if we're within a very recent cooldown (max 15s).
  // This prevents a single Gemini 429 from locking out all users for a full minute.
  if (Date.now() < quotaBlockedUntil) {
    const retryAfterSeconds = Math.max(1, Math.ceil((quotaBlockedUntil - Date.now()) / 1000));
    if (retryAfterSeconds > 1) {
      // Only block if there's meaningful time left; otherwise just try the request
      logger.info({ retryAfterSeconds }, 'Quota cooldown active, rejecting early');
      throw new HttpError(
        `AI is busy. Please try again in ${retryAfterSeconds} seconds.`,
        429,
        { retryAfterSeconds }
      );
    }
  }

  const language = params.preferredLanguage
    ? getLanguageCode(params.preferredLanguage)
    : detectChatLanguage(params.text);

  // ── 2b. Idempotency check ──
  const idempotencyHash = crypto
    .createHash('md5')
    .update(`${params.sessionId}:${params.text.trim()}:${params.imageBase64 || ''}`)
    .digest('hex');

  const existingResponse = await ChatMessageModel.findOne({
    sessionId: params.sessionId,
    role: 'assistant',
    idempotencyKey: `${idempotencyHash}:assistant`,
    createdAt: { $gt: new Date(Date.now() - 60_000) }, // Only reuse if within last 60 seconds
  }).lean();

  if (existingResponse) {
    logger.info({ sessionId: params.sessionId, hash: idempotencyHash }, 'Idempotency hit: returning cached response');
    const content = typeof existingResponse.content === 'string' 
      ? existingResponse.content 
      : (existingResponse.content as any).text || '';

    return {
      response: content,
      chatId: params.sessionId,
      audioBase64: existingResponse.metadata?.audioBase64,
      audioMimeType: existingResponse.metadata?.audioMimeType,
      cached: true,
      model: existingResponse.metadata?.modelVersion,
    };
  }

  try {
    // ── 3. Fetch farmer context + chat history in parallel ──
    const [farmerCtx, recentMessages, kbCacheName] = await Promise.all([
      getFarmerContext(params.farmerId),
      ChatHistoryCache.getRecentMessages(params.sessionId, 50),
      getKnowledgeBaseCacheName(),
    ]);

    // ── 4. Build Gemini history from DB messages ──
    const rawHistory: Content[] = [];
    for (const msg of recentMessages) {
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;

      let text: string = '';
      if (typeof msg.content === 'string') {
        text = msg.content;
      } else if (msg.content && typeof msg.content === 'object') {
        const contentType = (msg.content as any).type;
        if (contentType === 'tool_call' || contentType === 'tool_result') continue;
        text = (msg.content as any).text || '';
      }

      if (!text.trim()) continue;

      rawHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      });
    }

    // Sanitize: Gemini requires alternating user/model roles.
    const historyContents: Content[] = [];
    for (const content of rawHistory) {
      if (historyContents.length > 0 && historyContents[historyContents.length - 1].role === content.role) {
        const prevText = historyContents[historyContents.length - 1].parts[0].text || '';
        const currText = content.parts[0].text || '';
        historyContents[historyContents.length - 1].parts = [{ text: `${prevText}\n\n${currText}` }];
      } else {
        historyContents.push(content);
      }
    }

    // Truncate to budget
    const { contents: truncatedHistory } = await truncateConversationToBudget({
      historyContents,
      availableTokens: HISTORY_TOKEN_BUDGET,
      summarizeOlderMessages: summarizeConversationHistory,
    });

    // ── 5. Build current user message parts ──
    const userParts: Part[] = [{ text: params.text }];
    if (params.imageBase64 && params.imageMimeType) {
      userParts.push({
        inlineData: { data: params.imageBase64, mimeType: params.imageMimeType },
      });
    }

    // ── 6. Create Gemini model ──
    const modelConfig: any = {
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      tools: TOOL_DEFINITIONS,
      toolConfig: TOOL_CONFIG,
    };

    if (kbCacheName) {
      modelConfig.cachedContent = kbCacheName;
    } else {
      modelConfig.systemInstruction = `${SYSTEM_PROMPT}\n\n${farmerCtx.contextString}`;
    }

    const model = gemini.getGenerativeModel(modelConfig);
    const chat = model.startChat({ history: truncatedHistory });

    // ── 7. Send message and handle tool calls ──
    let responseText = '';
    let recommendedProducts: any[] = [];

    let geminiResult = await withTimeout(
      chat.sendMessage(userParts),
      GEMINI_API_TIMEOUT_MS,
      'Gemini AI'
    );

    let loopCount = 0;
    while (loopCount < MAX_TOOL_LOOPS) {
      const candidate = geminiResult.response.candidates?.[0];
      if (!candidate) break;

      const functionCalls = candidate.content?.parts?.filter((p) => 'functionCall' in p) || [];
      if (functionCalls.length === 0) break;

      const toolResponses: Part[] = [];
      for (const part of functionCalls) {
        if (!('functionCall' in part) || !part.functionCall) continue;
        const { name, args } = part.functionCall;
        try {
          const result = await executeTool(name, args as Record<string, unknown>);
          if (name === 'get_product_recommendations' && result.products) {
            recommendedProducts = result.products as any[];
          }
          toolResponses.push({ functionResponse: { name, response: result } });
        } catch (toolError) {
          toolResponses.push({
            functionResponse: { name, response: { error: 'Tool execution failed' } },
          });
        }
      }

      geminiResult = await withTimeout(
        chat.sendMessage(toolResponses),
        GEMINI_API_TIMEOUT_MS,
        'Gemini AI (tool follow-up)'
      );
      loopCount++;
    }

    try {
      responseText = geminiResult.response.text().trim();
    } catch (textErr) {
      responseText = getFriendlyError('provider_error', language);
    }

    // Generate audio if necessary (optional)
    let audioBase64: string | undefined;
    try {
      audioBase64 = await withTimeout(
        textToSpeech(responseText, getLanguageLabel(language)),
        TTS_TIMEOUT_MS,
        'TTS'
      );
    } catch (ttsErr) {
      logger.warn({ err: ttsErr, sessionId: params.sessionId }, 'TTS failed or timed out');
    }

    const processingTimeMs = Date.now() - startedAt;
    const cacheHit = !!kbCacheName;

    // ── 8. Deduct wallet BEFORE responding (so we can return accurate credits) ──
    let walletData: any = undefined;
    try {
      const wallet = await getWallet(params.farmerId);
      if (wallet) {
        const [updatedWallet] = await Promise.all([
          deductCredit(params.farmerId, 'chat'),
          incrementUsage(params.farmerId, 'chat'),
        ]);
        walletData = updatedWallet ? {
          chatCredits: updatedWallet.chatCredits,
          imageCredits: updatedWallet.imageCredits,
          topupCredits: updatedWallet.topupCredits,
          topupImageCredits: updatedWallet.topupImageCredits,
          plan: updatedWallet.plan,
        } : undefined;
      }
    } catch (walletErr) {
      logger.error({ err: walletErr, sessionId: params.sessionId }, 'Wallet deduction failed');
    }

    // ── 9. Fire-and-forget non-critical background work ──
    // DB persistence, session touch, and cache invalidation are not blocking.
    const doBackgroundWork = async () => {
      try {
        await Promise.all([
          persistExchange({
            sessionId: params.sessionId,
            farmerId: params.farmerId,
            userText: params.text,
            assistantText: responseText,
            language,
            processingTimeMs,
            cacheHit,
            idempotencyKey: idempotencyHash,
            imageBase64: params.imageBase64,
            audioBase64,
          }),
          touchChatSession(params.sessionId, params.text, responseText, farmerCtx.location),
          ChatHistoryCache.invalidate(params.sessionId),
        ]);
      } catch (bgErr) {
        logger.error({ err: bgErr, sessionId: params.sessionId }, 'Background work failed');
      }
    };

    doBackgroundWork();

    // ── 10. Generate quick reply suggestions (CPU-only, instant) ──
    const quickSuggestions = getQuickSuggestions({
      hasProducts: recommendedProducts.length > 0,
      language,
      crops: (farmerCtx as any)?.crops,
    });

    return {
      response: responseText,
      chatId: params.sessionId,
      quickReplies: quickSuggestions.map((s: QuerySuggestion) => s.text),
      recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : undefined,
      model: env.GEMINI_MODEL,
      cached: cacheHit,
      audioBase64,
      audioMimeType: audioBase64 ? 'audio/mp3' : undefined,
      wallet: walletData,
    };

  } catch (error) {
    // ── Error handling — NO persistence of failed messages ──
    if (isQuotaError(error)) {
      const delayMs = parseRetryDelayMs(error);
      quotaBlockedUntil = Date.now() + delayMs;
      const retryAfterSeconds = Math.max(1, Math.ceil(delayMs / 1000));
      const msg = getQuotaExceededMessage(language, retryAfterSeconds);

      logger.warn(
        { retryAfterSeconds, blockedUntil: new Date(quotaBlockedUntil).toISOString() },
        'Gemini quota exceeded'
      );
      throw new HttpError(msg, 429, { retryAfterSeconds });
    }

    if (isTemporaryProviderError(error)) {
      logger.warn({ err: error, sessionId: params.sessionId }, 'Gemini provider temporarily unavailable');
      throw new HttpError(getFriendlyError('provider_unavailable', language), 503);
    }

    // Timeout vs safety vs generic
    const isTimeout =
      (error instanceof Error && error.message.includes('timed out')) ||
      (error instanceof GoogleGenerativeAIFetchError &&
        (error.status === 408 || /timeout/i.test(error.message)));
    const isSafety = error instanceof GoogleGenerativeAIResponseError;
    const code = isTimeout ? 'timeout' : isSafety ? 'safety' : 'provider_error';
    const statusCode = isTimeout ? 504 : isSafety ? 400 : 500;

    logger.error({ err: error, sessionId: params.sessionId }, 'Chat message processing failed');
    
    // Provide a more detailed error message in non-production to aid debugging
    const originalMessage = error instanceof Error ? `: ${error.message}` : '';
    const userMessage = env.NODE_ENV !== 'production' 
      ? `${getFriendlyError(code, language)} (Debug${originalMessage})`
      : getFriendlyError(code, language);

    throw new HttpError(userMessage, statusCode);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API: sendVoiceMessage
// ══════════════════════════════════════════════════════════════════════════════

export async function sendVoiceMessage(params: {
  farmerId: string;
  sessionId: string;
  audioBase64: string;
  mimeType: string;
  fileName: string;
  preferredLanguage?: string;
}): Promise<ChatMessageResult & { transcript: string }> {
  // Step 1: STT
  const sttResult = await speechToText(
    params.audioBase64,
    params.preferredLanguage,
    params.mimeType,
    params.fileName
  );

  if (!sttResult.text || sttResult.text.trim().length === 0) {
    throw new HttpError('Could not understand the audio. Please try again.', 400);
  }

  // Step 2: Send as text message
  const chatResult = await sendChatMessage({
    farmerId: params.farmerId,
    sessionId: params.sessionId,
    text: sttResult.text,
    preferredLanguage: params.preferredLanguage,
  });

  return {
    ...chatResult,
    transcript: sttResult.text,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERNAL: Persist a successful user+assistant exchange
// ══════════════════════════════════════════════════════════════════════════════

async function persistExchange(params: {
  sessionId: string;
  farmerId: string;
  userText: string;
  assistantText: string;
  language: ChatLanguage;
  processingTimeMs: number;
  cacheHit: boolean;
  idempotencyKey: string;
  imageBase64?: string;
  audioBase64?: string;
}): Promise<void> {
  const now = new Date();

  try {
    // Use the correct schema format: content is { type, text } not a raw string
    await ChatMessageModel.insertMany([
      {
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        role: 'user',
        content: {
          type: 'text',
          text: params.userText,
          ...(params.imageBase64 ? { imageUrl: 'inline' } : {}),
        },
        language: params.language,
        idempotencyKey: `${params.idempotencyKey}:user`,
        createdAt: now,
      },
      {
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        role: 'assistant',
        content: {
          type: 'text',
          text: params.assistantText,
        },
        language: params.language,
        idempotencyKey: `${params.idempotencyKey}:assistant`,
        metadata: {
          model: env.GEMINI_MODEL,
          processingTimeMs: params.processingTimeMs,
          cacheHit: params.cacheHit,
          ...(params.audioBase64 ? { audioBase64: params.audioBase64, audioMimeType: 'audio/mp3' } : {}),
        },
        createdAt: new Date(now.getTime() + 1), // +1ms ensures correct order
      },
    ], { ordered: false });
  } catch (error: any) {
    // If it's a duplicate key error (idempotency), ignore it
    if (error.code === 11000) {
      logger.info({ idempotencyKey: params.idempotencyKey }, 'Duplicate message detected, skipping');
      return;
    }
    logger.error({ err: error, sessionId: params.sessionId }, 'Failed to persist chat exchange');
    // Don't throw — persistence failure shouldn't break the user's experience
  }
}
