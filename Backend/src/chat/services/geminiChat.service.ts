import {
  Content,
  FunctionCall,
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai';
import type { FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Subscription } from '../../models/Subscription';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SYSTEM_PROMPT } from '../data/systemPrompt';
import { ChatMessageModel } from '../models/ChatMessage.model';
import { getFarmerContext } from './contextBuilder.service';
import { summarizeConversationHistory } from './historyCompressor.service';
import { getKnowledgeBaseCacheName } from './knowledgeBase.service';
import { ensureSessionOwnership, touchChatSession } from './sessionManager.service';
import { executeTool, TOOL_CONFIG, TOOL_DEFINITIONS } from '../tools';
import { detectChatLanguage } from '../utils/languageDetector';
import { estimateTextTokens } from '../utils/tokenCounter';
import { truncateConversationToBudget } from '../utils/contextTruncator';
import { HttpError } from '../utils/httpError';
import { speechToText } from '../../services/voice/sarvamSTT';
import { textToSpeech } from '../../services/voice/sarvamTTS';
import { ChatHistoryCache, type LeanChatMessage } from './chatHistoryCache.service';
import { getQuickSuggestions, generateQuerySuggestions } from './querySuggestions.service';

const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
type PreferredChatLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Punjabi';
type ChatLanguageCode = 'hi' | 'en' | 'gu' | 'pa';
const MAX_TOTAL_TOKENS = 32000;
const RESERVED_OUTPUT_TOKENS = 2000;
const RESERVED_SYSTEM_TOKENS = 500;
const RESERVED_CONTEXT_TOKENS = 500;
const HISTORY_TOKEN_BUDGET =
  MAX_TOTAL_TOKENS - RESERVED_OUTPUT_TOKENS - RESERVED_SYSTEM_TOKENS - RESERVED_CONTEXT_TOKENS;

// API timeout for Gemini calls (30 seconds)
const GEMINI_API_TIMEOUT_MS = 30_000;

let quotaBlockedUntil = 0;

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

function isQuotaError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as { status?: number }).status;
  const msg = ((err as { message?: string }).message || '').toLowerCase();
  return (
    status === 429 ||
    msg.includes('quota exceeded') ||
    msg.includes('generate_content_free_tier_requests') ||
    msg.includes('too many requests')
  );
}

function parseRetryDelayMs(err: unknown): number {
  if (typeof err !== 'object' || err === null) return 15_000;
  const details = (err as { errorDetails?: Array<Record<string, unknown>> }).errorDetails;
  if (Array.isArray(details)) {
    const retryInfo = details.find(
      (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    ) as { retryDelay?: string } | undefined;
    const delay = retryInfo?.retryDelay;
    if (typeof delay === 'string' && delay.endsWith('s')) {
      const seconds = Number.parseFloat(delay.slice(0, -1));
      if (!Number.isNaN(seconds) && seconds > 0) {
        return Math.ceil(seconds * 1000);
      }
    }
  }

  const msg = (err as { message?: string }).message || '';
  const match = msg.match(/retry in\s+([\d.]+)s/i);
  if (match?.[1]) {
    const seconds = Number.parseFloat(match[1]);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000);
    }
  }

  return 15_000;
}

function isTemporaryProviderError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as { status?: number }).status;
  const msg = ((err as { message?: string }).message || '').toLowerCase();
  return (
    status === 503 ||
    msg.includes('service unavailable') ||
    msg.includes('high demand') ||
    msg.includes('temporarily unavailable')
  );
}

function mapStoredMessageToGeminiContent(message: LeanChatMessage): Content {
  if (message.content.type === 'tool_call') {
    return {
      role: 'model',
      parts: [
        {
          text: `Tool call: ${message.content.toolName}\n${JSON.stringify(message.content.toolInput || {}, null, 2)}`,
        },
      ],
    };
  }

  if (message.content.type === 'tool_result') {
    return {
      role: 'user',
      parts: [
        {
          text: `Tool result from ${message.content.toolName}: ${JSON.stringify(
            message.content.toolOutput || {},
            null,
            2
          )}`,
        },
      ],
    };
  }

  return {
    role: message.role === 'assistant' ? 'model' : message.role,
    parts: [
      {
        text: message.content.text || '',
      },
    ],
  };
}

function buildImageParts(text: string, imageBase64?: string, imageMimeType?: string) {
  if (!imageBase64) {
    return [{ text }];
  }

  return [
    { text },
    {
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: imageBase64,
      },
    },
  ];
}

function resolveChatLanguage(text: string, preferredLanguage?: PreferredChatLanguage): ChatLanguageCode {
  if (preferredLanguage === 'Hindi') return 'hi';
  if (preferredLanguage === 'Gujarati') return 'gu';
  if (preferredLanguage === 'Punjabi') return 'pa';
  if (preferredLanguage === 'English') return 'en';
  return detectChatLanguage(text) as ChatLanguageCode;
}

function getLanguageInstruction(language: ChatLanguageCode): string {
  if (language === 'hi') {
    return 'Respond fully in Hindi unless the farmer explicitly changes language.';
  }
  if (language === 'gu') {
    return 'Respond fully in Gujarati unless the farmer explicitly changes language.';
  }
  if (language === 'pa') {
    return 'Respond fully in Punjabi unless the farmer explicitly changes language.';
  }
  return 'Respond fully in English unless the farmer explicitly changes language.';
}

function getLanguageLabel(language: ChatLanguageCode): string {
  if (language === 'hi') return 'Hindi';
  if (language === 'gu') return 'Gujarati';
  if (language === 'pa') return 'Punjabi';
  return 'English';
}

function getFriendlyErrorMessage(language: ChatLanguageCode, code: string): string {
  if (language === 'hi') {
    if (code === 'timeout') {
      return 'उत्तर आने में बहुत समय लग रहा है। कृपया थोड़ी देर बाद फिर कोशिश करें।';
    }

    if (code === 'safety') {
      return 'मैं इस प्रश्न का सुरक्षित उत्तर नहीं दे सकता। कृपया इसे दूसरे तरीके से पूछें।';
    }

    return 'अभी चैट सेवा में दिक्कत है। कृपया थोड़ी देर बाद फिर कोशिश करें।';
  }

  if (language === 'gu') {
    if (code === 'timeout') {
      return 'AI જવાબ આવવામાં વધુ સમય લાગી રહ્યો છે. કૃપા કરીને થોડી વાર પછી ફરી પ્રયત્ન કરો.';
    }

    if (code === 'safety') {
      return 'હું આ વિનંતીનો સલામત જવાબ આપી શકતો નથી. કૃપા કરીને પ્રશ્ન ફરીથી પૂછો.';
    }

    return 'ચેટ સેવા હાલ તાત્કાલિક ઉપલબ્ધ નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયત્ન કરો.';
  }

  if (language === 'pa') {
    if (code === 'timeout') {
      return 'AI ਜਵਾਬ ਆਉਣ ਵਿੱਚ ਵਧੇਰੇ ਸਮਾਂ ਲੱਗ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।';
    }

    if (code === 'safety') {
      return 'ਮੈਂ ਇਸ ਬੇਨਤੀ ਦਾ ਸੁਰੱਖਿਅਤ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਸਵਾਲ ਨੂੰ ਹੋਰ ਢੰਗ ਨਾਲ ਪੁੱਛੋ।';
    }

    return 'ਚੈਟ ਸੇਵਾ ਇਸ ਵੇਲੇ ਅਸਥਾਈ ਤੌਰ ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।';
  }

  if (code === 'timeout') {
    return 'The AI response is taking too long. Please try again in a moment.';
  }

  if (code === 'safety') {
    return 'I cannot answer that request safely. Please rephrase the question.';
  }

  return 'The chat service is temporarily unavailable. Please try again shortly.';
}

function getSafeFriendlyErrorMessage(_language: ChatLanguageCode, code: string): string {
  if (code === 'timeout') {
    return 'The AI response is taking too long. Please try again in a moment.';
  }

  if (code === 'safety') {
    return 'I cannot answer that request safely. Please rephrase the question.';
  }

  if (code === 'provider_unavailable') {
    return 'The AI service is temporarily busy. Please try again shortly.';
  }

  return 'The chat service is temporarily unavailable. Please try again shortly.';
}

function getQuotaLimitedMessage(language: ChatLanguageCode, retryAfterSeconds: number): string {
  if (language === 'hi') return `Gemini API quota अभी limit हो गई है। कृपया ${retryAfterSeconds}s बाद फिर कोशिश करें।`;
  if (language === 'gu') return `Gemini API quota હાલમાં મર્યાદા પર છે. કૃપા કરીને ${retryAfterSeconds}s પછી ફરી પ્રયત્ન કરો.`;
  if (language === 'pa') return `Gemini API quota ਇਸ ਵੇਲੇ ਸੀਮਾ ਤੇ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ${retryAfterSeconds}s ਬਾਅਦ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`;
  return `Gemini API quota is currently limited. Please retry in ${retryAfterSeconds}s.`;
}

function getQuotaExceededMessage(language: ChatLanguageCode, retryAfterSeconds: number): string {
  if (language === 'hi') return `आज Gemini API quota limit हो गई है। कृपया ${retryAfterSeconds}s बाद फिर कोशिश करें।`;
  if (language === 'gu') return `Gemini API quota પૂર્ણ થઈ ગઈ છે. કૃપા કરીને ${retryAfterSeconds}s પછી ફરી પ્રયત્ન કરો.`;
  if (language === 'pa') return `Gemini API quota ਸਮਾਪਤ ਹੋ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ${retryAfterSeconds}s ਬਾਅਦ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`;
  return `Gemini API quota exceeded. Please retry in ${retryAfterSeconds}s.`;
}

async function buildConversationContents(params: {
  sessionId: string;
  farmerId: string;
  newUserMessage: string;
  preferredLanguage: ChatLanguageCode;
  imageBase64?: string;
  imageMimeType?: string;
}) {
  // OPTIMIZATION: Parallelize independent operations
  const [{ contextString, location, season }, previousMessages] = await Promise.all([
    getFarmerContext(params.farmerId),
    ChatHistoryCache.getRecentMessages(params.sessionId, 50), // Use cache
  ]);

  const effectiveContextString = `${contextString}\n\nACTIVE CONVERSATION LANGUAGE: ${getLanguageLabel(
    params.preferredLanguage
  )}\nAlways answer in this active conversation language unless the farmer clearly switches language.`;

  const historyContents = previousMessages.map(mapStoredMessageToGeminiContent);
  const truncated = await truncateConversationToBudget({
    historyContents,
    availableTokens: HISTORY_TOKEN_BUDGET,
    summarizeOlderMessages: summarizeConversationHistory,
  });

  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: effectiveContextString }],
    },
    {
      role: 'model',
      parts: [
        {
          text: `Understood. I have noted your profile and will personalize all advice accordingly. ${getLanguageInstruction(
            params.preferredLanguage
          )}`,
        },
      ],
    },
    ...truncated.contents,
    {
      role: 'user',
      parts: buildImageParts(params.newUserMessage, params.imageBase64, params.imageMimeType),
    },
  ];

  return { contents, contextString, location, season, summaryUsed: truncated.summaryUsed, isFirstMessage: previousMessages.length === 0 };
}

async function runToolLoop(params: {
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;
  contents: Content[];
}): Promise<{ result: any; products: any[] }> {
  const currentResponse = await params.model.generateContent({
    contents: params.contents,
  });

  const collectedProducts: any[] = [];
  const firstRoundCallContents: Content = { role: 'model', parts: [] };
  const toolMessages: Content[] = [];

  const firstRoundCalls = currentResponse.response.candidates?.[0]?.content?.parts?.filter(
    (p: any) => p.functionCall
  );

  if (!firstRoundCalls || firstRoundCalls.length === 0) {
    return { result: currentResponse, products: [] };
  }

  // Execute tools sequentially or in parallel? Parallel is better.
  const settlement = await Promise.allSettled(
    firstRoundCalls.map(async (part: any) => {
      const call = part.functionCall;
      const toolResult = await executeTool(call.name, call.args as Record<string, unknown>);
      return { name: call.name, args: call.args, response: toolResult };
    })
  );

  for (const res of settlement) {
    if (res.status === 'fulfilled') {
      const { name, args, response } = res.value;
      firstRoundCallContents.parts.push({ functionCall: { name, args } });
      
      // Collect product recommendations for UI
      if (name === 'get_product_recommendations' && (response as any).products) {
        collectedProducts.push(...((response as any).products || []));
      }

      toolMessages.push({
        role: 'user',
        parts: [{ functionResponse: { name, response } }],
      });
    }
  }

  const finalResult = await params.model.generateContent({
    contents: [...params.contents, firstRoundCallContents, ...toolMessages],
  });

  return { result: finalResult, products: collectedProducts };
}

async function persistSuccessfulExchange(params: {
  sessionId: string;
  farmerId: string;
  userText: string;
  assistantText: string;
  imageBase64?: string;
  language: ChatLanguageCode;
  processingTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  cacheHit: boolean;
  location?: string;
  audioBase64?: string;
  audioMimeType?: string;
  recommendedProducts?: any[];
}) {
  await ChatMessageModel.create([
    {
      sessionId: new mongoose.Types.ObjectId(params.sessionId),
      farmerId: new mongoose.Types.ObjectId(params.farmerId),
      role: 'user',
      content: {
        type: params.imageBase64 ? 'image' : 'text',
        text: params.userText || (params.imageBase64 ? 'Image context' : ''),
      },
      metadata: {
        inputTokens: params.inputTokens,
        processingTimeMs: params.processingTimeMs,
        modelVersion: env.GEMINI_MODEL,
        cacheHit: params.cacheHit,
        language: params.language,
      },
    },
    {
      sessionId: new mongoose.Types.ObjectId(params.sessionId),
      farmerId: new mongoose.Types.ObjectId(params.farmerId),
      role: 'assistant',
      content: {
        type: 'text',
        text: params.assistantText,
      },
      metadata: {
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        processingTimeMs: params.processingTimeMs,
        modelVersion: env.GEMINI_MODEL,
        cacheHit: params.cacheHit,
        language: params.language,
        location: params.location,
        audioBase64: params.audioBase64,
        audioMimeType: params.audioMimeType,
        recommendedProducts: params.recommendedProducts,
      },
    },
  ]);

  await touchChatSession({
    sessionId: params.sessionId,
    location: params.location,
    userText: params.userText,
    assistantText: params.assistantText,
  });

  await Subscription.findOneAndUpdate({ userId: params.farmerId }, { $inc: { queriesUsed: 1 } });
}

async function persistFailedExchange(params: {
  sessionId: string;
  farmerId: string;
  userText: string;
  imageBase64?: string;
  language: ChatLanguageCode;
  processingTimeMs: number;
  errorCode: string;
  errorMessage: string;
}) {
  await ChatMessageModel.create([
    {
      sessionId: params.sessionId,
      farmerId: params.farmerId,
      role: 'user',
      content: {
        type: params.imageBase64 ? 'image' : 'text',
        text: params.userText,
      },
      metadata: {
        processingTimeMs: params.processingTimeMs,
        modelVersion: env.GEMINI_MODEL,
        language: params.language,
      },
    },
    {
      sessionId: params.sessionId,
      farmerId: params.farmerId,
      role: 'assistant',
      content: {
        type: 'text',
        text: params.errorMessage,
      },
      metadata: {
        processingTimeMs: params.processingTimeMs,
        modelVersion: env.GEMINI_MODEL,
        language: params.language,
      },
      error: {
        code: params.errorCode,
        message: params.errorMessage,
      },
    },
  ]);
}

export async function sendChatMessage(params: {
  farmerId: string;
  sessionId: string;
  text: string;
  preferredLanguage?: PreferredChatLanguage;
  imageBase64?: string;
  imageMimeType?: string;
  forceVoiceReply?: boolean;
}) {
  if (Date.now() < quotaBlockedUntil) {
    const retryMs = quotaBlockedUntil - Date.now();
    const retryAfterSeconds = Math.max(1, Math.ceil(retryMs / 1000));
    const language = resolveChatLanguage(params.text, params.preferredLanguage);
    const message = getQuotaLimitedMessage(language, retryAfterSeconds);
    throw new HttpError(message, 429, { retryAfterSeconds });
  }

  const startedAt = Date.now();
  const session = await ensureSessionOwnership(params.farmerId, params.sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  const language = resolveChatLanguage(params.text, params.preferredLanguage);
  const kbCacheName = await getKnowledgeBaseCacheName();
  const built = await buildConversationContents({
    sessionId: params.sessionId,
    farmerId: params.farmerId,
    newUserMessage: params.text,
    preferredLanguage: language,
    imageBase64: params.imageBase64,
    imageMimeType: params.imageMimeType,
  });
  const inputTokens = estimateTextTokens(
    built.contents
      .flatMap((content) =>
        content.parts.map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
      )
      .join(' ')
  );

  const model = gemini.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    tools: TOOL_DEFINITIONS,
    toolConfig: TOOL_CONFIG,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.4,
      topP: 0.8,
    },
  });

  try {
    let result = await withTimeout(
      model.generateContent({
        contents: built.contents,
        ...(kbCacheName ? { cachedContent: kbCacheName } : {}),
      }),
      GEMINI_API_TIMEOUT_MS,
      'AI response timed out. Please try again.'
    );

    let recommendedProducts: any[] = [];
    const functionCalls = result.response.functionCalls();
    if (functionCalls?.length) {
     const { result: chatResult, products: recommendedProducts } = await runToolLoop({
      model,
      contents: built.contents,
    });
      result = chatResult;
    }

    const responseText = result.response.text().trim();
    const processingTimeMs = Date.now() - startedAt;
    const usage = result.response.usageMetadata;
    const outputTokens = usage?.candidatesTokenCount || estimateTextTokens(responseText);
    const cacheHit = Boolean(usage?.cachedContentTokenCount);
    let audioBase64: string | undefined;
    let audioMimeType: string | undefined;
    const shouldGenerateVoice = true; // Part 4B: Always generate voice for AI replies

    // OPTIMIZATION: Run TTS and suggestions generation in parallel (non-blocking)
    const [ttsResult, suggestions] = await Promise.allSettled([
      // TTS (only if needed)
      shouldGenerateVoice
        ? textToSpeech(responseText, getLanguageLabel(language))
            .then((audio) => ({ audioBase64: audio, audioMimeType: 'audio/mp3' as const }))
            .catch((err) => {
              logger.warn({ err, sessionId: params.sessionId }, 'TTS failed');
              return undefined;
            })
        : Promise.resolve(undefined),

      // Query suggestions (async, use quick fallback if AI fails)
      getQuickSuggestions({
        hasProducts: responseText.toLowerCase().includes('product') || responseText.toLowerCase().includes('खरीद'),
        language: language,
        crops: built.contextString.match(/crops?:\s*([^.\n]+)/i)?.[1]?.split(',').map((c) => c.trim()),
      }),
    ]);

    if (ttsResult.status === 'fulfilled' && ttsResult.value) {
      audioBase64 = ttsResult.value.audioBase64;
      audioMimeType = ttsResult.value.audioMimeType;
    }

    const querySuggestions = suggestions.status === 'fulfilled' ? suggestions.value : [];

    await persistSuccessfulExchange({
      sessionId: params.sessionId,
      farmerId: params.farmerId,
      userText: params.text,
      assistantText: responseText,
      imageBase64: params.imageBase64,
      language,
      processingTimeMs,
      inputTokens: usage?.promptTokenCount || inputTokens,
      outputTokens,
      cacheHit,
      location: built.location,
      audioBase64,
      audioMimeType,
      recommendedProducts,
    });

    // Invalidate chat cache after successful message
    await ChatHistoryCache.invalidate(params.sessionId);

    return {
      messageId: `${params.sessionId}:${Date.now()}`,
      response: responseText,
      tokensUsed: usage?.totalTokenCount || inputTokens + outputTokens,
      processingTime: processingTimeMs,
      modelVersion: env.GEMINI_MODEL,
      cacheHit,
      language,
      summaryUsed: built.summaryUsed,
      audioBase64,
      audioMimeType,
      suggestedQueries: querySuggestions,
      recommendedProducts, // Part 4D: Return products to UI
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startedAt;
    if (isQuotaError(error)) {
      const delayMs = parseRetryDelayMs(error);
      quotaBlockedUntil = Date.now() + delayMs;
      const retryAfterSeconds = Math.max(1, Math.ceil(delayMs / 1000));
      const msg = getQuotaExceededMessage(language, retryAfterSeconds);

      await persistFailedExchange({
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        userText: params.text,
        imageBase64: params.imageBase64,
        language,
        processingTimeMs,
        errorCode: 'quota',
        errorMessage: msg,
      });

      logger.warn(
        { retryAfterSeconds, blockedUntil: new Date(quotaBlockedUntil).toISOString() },
        'Gemini quota exceeded; enabling temporary cooldown'
      );
      throw new HttpError(msg, 429, { retryAfterSeconds });
    }

    if (isTemporaryProviderError(error)) {
      const message = getSafeFriendlyErrorMessage(language, 'provider_unavailable');

      await persistFailedExchange({
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        userText: params.text,
        imageBase64: params.imageBase64,
        language,
        processingTimeMs,
        errorCode: 'provider_unavailable',
        errorMessage: message,
      });

      logger.warn(
        { err: error, sessionId: params.sessionId, farmerId: params.farmerId },
        'Gemini provider temporarily unavailable'
      );
      throw new HttpError(message, 503);
    }

    const timeout =
      error instanceof GoogleGenerativeAIFetchError &&
      (error.status === 408 || /timeout/i.test(error.message));
    const safety = error instanceof GoogleGenerativeAIResponseError;
    const code = timeout ? 'timeout' : safety ? 'safety' : 'provider_error';
    const message = getSafeFriendlyErrorMessage(language, code);

    await persistFailedExchange({
      sessionId: params.sessionId,
      farmerId: params.farmerId,
      userText: params.text,
      imageBase64: params.imageBase64,
      language,
      processingTimeMs,
      errorCode: code,
      errorMessage: message,
    });

    logger.error({ err: error, sessionId: params.sessionId, farmerId: params.farmerId }, 'Chat message processing failed');
    throw new Error(message);
  }
}

export async function sendVoiceMessage(params: {
  farmerId: string;
  sessionId: string;
  audioBase64: string;
  mimeType?: string;
  fileName?: string;
  preferredLanguage?: PreferredChatLanguage;
}) {
  const transcription = await speechToText(
    params.audioBase64,
    params.preferredLanguage,
    params.mimeType,
    params.fileName
  );

  const transcript = transcription.text.trim();
  if (!transcript) {
    throw new HttpError('Unable to transcribe the voice message.', 400);
  }

  const chatResult = await sendChatMessage({
    farmerId: params.farmerId,
    sessionId: params.sessionId,
    text: transcript,
    preferredLanguage: params.preferredLanguage,
    forceVoiceReply: true,
  });

  const audioBase64 =
    chatResult.audioBase64 || (await textToSpeech(chatResult.response, chatResult.language));
  const audioMimeType = chatResult.audioMimeType || 'audio/mp3';
  const since = new Date(Date.now() - 60_000);

  await Promise.all([
    ChatMessageModel.findOneAndUpdate(
      {
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        role: 'user',
        'content.text': transcript,
        createdAt: { $gte: since },
      },
      {
        $set: {
          'metadata.voiceInput': true,
          'metadata.audioMimeType': params.mimeType || 'audio/m4a',
        },
      },
      { sort: { createdAt: -1 } }
    ),
    ChatMessageModel.findOneAndUpdate(
      {
        sessionId: params.sessionId,
        farmerId: params.farmerId,
        role: 'assistant',
        'content.text': chatResult.response,
        createdAt: { $gte: since },
      },
      {
        $set: {
          'metadata.audioBase64': audioBase64,
          'metadata.audioMimeType': audioMimeType,
        },
      },
      { sort: { createdAt: -1 } }
    ),
  ]);

  return {
    chatId: params.sessionId,
    transcript,
    answer: chatResult.response,
    audioBase64,
    audioMimeType,
    language: chatResult.language,
    processingTime: chatResult.processingTime,
    modelVersion: chatResult.modelVersion,
  };
}

export async function streamChatMessage(params: {
  farmerId: string;
  sessionId: string;
  text: string;
  preferredLanguage?: PreferredChatLanguage;
  imageBase64?: string;
  imageMimeType?: string;
  reply: FastifyReply;
}) {
  const writeEvent = (event: string, data: unknown) => {
    params.reply.raw.write(`event: ${event}\n`);
    params.reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await sendChatMessage(params);
    const words = result.response.split(/(\s+)/).filter(Boolean);

    params.reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    writeEvent('start', { sessionId: params.sessionId });

    for (const token of words) {
      writeEvent('token', { token });
    }

    writeEvent('done', result);
  } catch (error) {
    if (!params.reply.raw.headersSent) {
      params.reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    writeEvent('error', { message: errorMessage, statusCode });
  } finally {
    params.reply.raw.end();
  }
}
