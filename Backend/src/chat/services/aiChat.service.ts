/**
 * aiChat.service.ts — core chat service, powered by Claude (Anthropic).
 *
 * KEY DESIGN PRINCIPLES:
 *   1. Respond FIRST, persist AFTER — The HTTP response is sent as soon as the AI
 *      responds. DB writes and TTS are non-critical background work.
 *   2. No error persistence — Failed exchanges are NOT saved to the DB. Error
 *      messages are transient UI feedback; saving them caused duplicate messages.
 *   3. Typed errors — All thrown errors are HttpError instances so the error
 *      handler preserves user-friendly messages.
 *   4. TTS timeout — TTS is capped so it can never block the response.
 *   5. Tool loop safety — The tool call loop has a hard cap.
 *   6. Prompt caching — The system prompt + knowledge base (tens of thousands of
 *      tokens) is identical for every farmer and cached; per-farmer context comes
 *      after the cache breakpoint.
 *
 * Only the user's text and the assistant's final text are stored, so tool calls
 * never show up in the app's chat history.
 */

import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { HttpError } from '../utils/httpError';

// Services
import { textToSpeech } from '../../services/voice/sarvamTTS';
import { speechToText } from '../../services/voice/sarvamSTT';
import { ChatHistoryCache } from './chatHistoryCache.service';
import { getFarmerContext } from './contextBuilder.service';
import { getKnowledgeBaseText } from './knowledgeBase.service';
import { touchChatSession } from './sessionManager.service';
import { getQuickSuggestions, type QuerySuggestion } from './querySuggestions.service';
import { summarizeConversationHistory } from './historyCompressor.service';
import { truncateConversationToBudget } from '../utils/contextTruncator';
import type { HistoryTurn } from '../utils/tokenCounter';
import { deductCredit, getWallet } from '../../services/walletService';
import { incrementUsage } from '../../services/subscriptionService';
import {
  createMessage,
  classifyClaudeError,
  ClaudeRefusalError,
  CLAUDE_MODEL,
  getResponseText,
  getRetryAfterSeconds,
  toClaudeImageMediaType,
} from '../../services/ai/claudeClient';

// Chat tools
import { TOOL_DEFINITIONS, executeTool } from '../tools';

// Models
import { ChatMessageModel } from '../models/ChatMessage.model';

// Data
import { SYSTEM_PROMPT } from '../data/systemPrompt';

// Utils
import { detectChatLanguage, toUserLanguage, type ChatLanguage } from '../utils/languageDetector';

// ── Configuration ──

// The mobile app waits up to 90s. Worst case here is 3 AI calls × 25s + 5s TTS = 80s.
const AI_CALL_TIMEOUT_MS = 25_000;
const TTS_TIMEOUT_MS = 5_000;             // 5s cap for TTS (non-critical, can fail gracefully)
const MAX_TOOL_LOOPS = 2;                 // max 2 tool rounds, then a final answer without tools
const HISTORY_TOKEN_BUDGET = 12_000;      // token budget for conversation history

// ── Rate-limit cooldown ──

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
  unsupported_image: {
    en: 'This image format is not supported. Please send a JPEG, PNG or WebP photo.',
    hi: 'यह फ़ोटो फ़ॉर्मेट समर्थित नहीं है। कृपया JPEG, PNG या WebP फ़ोटो भेजें।',
    gu: 'આ ફોટો ફોર્મેટ સપોર્ટેડ નથી. કૃપા કરીને JPEG, PNG અથવા WebP ફોટો મોકલો.',
    pa: 'ਇਹ ਫੋਟੋ ਫਾਰਮੈਟ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ JPEG, PNG ਜਾਂ WebP ਫੋਟੋ ਭੇਜੋ।',
  },
};

function getFriendlyError(code: string, lang: ChatLanguage): string {
  return friendlyErrors[code]?.[lang] || friendlyErrors.provider_error[lang];
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

// ── Helper: system prompt ──

/**
 * Builds the system prompt. The first block (persona + knowledge base) is the same
 * for every request and carries the cache breakpoint; the second block is the
 * per-farmer context and is not cached.
 */
async function buildSystemBlocks(params: {
  farmerContext: string;
  language: ChatLanguage;
  conversationSummary?: string;
}): Promise<Anthropic.TextBlockParam[]> {
  const kbText = await getKnowledgeBaseText();
  const languageLabel = getLanguageLabel(params.language);

  const farmerBlock = [
    `Farmer profile (use it to personalise advice; do not repeat it back):\n${params.farmerContext}`,
    params.conversationSummary
      ? `Summary of the earlier part of this conversation:\n${params.conversationSummary}`
      : '',
    `Respond entirely in ${languageLabel}.${params.language !== 'en' ? ' Do not answer in English.' : ''}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return [
    {
      type: 'text',
      text: `${SYSTEM_PROMPT}\n\nHere is the verified agricultural database:\n${kbText}`,
      cache_control: { type: 'ephemeral', ttl: '1h' },
    },
    { type: 'text', text: farmerBlock },
  ];
}

// ── Helper: one Claude call ──

function callClaude(
  system: Anthropic.TextBlockParam[],
  messages: Anthropic.MessageParam[],
  allowTools: boolean,
  label: string
): Promise<Anthropic.Message> {
  return withTimeout(
    createMessage(
      {
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        output_config: { effort: 'low' },
        system,
        tools: TOOL_DEFINITIONS,
        tool_choice: allowTools ? { type: 'auto' } : { type: 'none' },
        messages,
      },
      { timeout: AI_CALL_TIMEOUT_MS, maxRetries: 0 }
    ),
    AI_CALL_TIMEOUT_MS,
    label
  );
}

// ── Helper: one full Claude reply, including the tool-call loop ──

export interface ChatReply {
  text: string;
  recommendedProducts: any[];
  toolRounds: number;
  /** The final Claude response (for usage / cache stats). */
  response: Anthropic.Message;
}

/**
 * Sends the conversation to Claude, runs any tool calls it makes, and returns the
 * final answer. Has no database side effects.
 */
export async function generateChatReply(params: {
  history: HistoryTurn[];
  farmerContext: string;
  language: ChatLanguage;
  conversationSummary?: string;
  text: string;
  imageBase64?: string;
  imageMediaType?: ReturnType<typeof toClaudeImageMediaType>;
}): Promise<ChatReply> {
  const system = await buildSystemBlocks({
    farmerContext: params.farmerContext,
    language: params.language,
    conversationSummary: params.conversationSummary,
  });

  // History + current user message (with optional image)
  const currentContent: Anthropic.ContentBlockParam[] = [];
  if (params.imageBase64 && params.imageMediaType) {
    const cleanBase64 = params.imageBase64.includes(',')
      ? params.imageBase64.split(',')[1] || params.imageBase64
      : params.imageBase64;
    currentContent.push({
      type: 'image',
      source: { type: 'base64', media_type: params.imageMediaType, data: cleanBase64.replace(/\s/g, '') },
    });
  }
  currentContent.push({ type: 'text', text: params.text });

  const messages: Anthropic.MessageParam[] = [
    ...params.history.map((turn) => ({ role: turn.role, content: turn.text }) as Anthropic.MessageParam),
    { role: 'user', content: currentContent },
  ];

  let recommendedProducts: any[] = [];
  let response = await callClaude(system, messages, true, 'Claude AI');

  let toolRounds = 0;
  while (response.stop_reason === 'tool_use') {
    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );
    if (toolUses.length === 0) break;

    messages.push({ role: 'assistant', content: response.content });

    // Run all tool calls of this turn and return every result in one user message.
    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUses.map(async (toolUse): Promise<Anthropic.ToolResultBlockParam> => {
        try {
          const result = await executeTool(toolUse.name, (toolUse.input ?? {}) as Record<string, unknown>);
          if (toolUse.name === 'get_product_recommendations' && Array.isArray(result.products)) {
            recommendedProducts = result.products as any[];
          }
          return { type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) };
        } catch (toolError) {
          logger.warn({ err: toolError, tool: toolUse.name }, 'Chat tool execution failed');
          return {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            is_error: true,
            content: 'Tool execution failed',
          };
        }
      })
    );
    messages.push({ role: 'user', content: toolResults });

    toolRounds++;
    // After the last allowed tool round, ask for the final answer without tools.
    response = await callClaude(system, messages, toolRounds < MAX_TOOL_LOOPS, 'Claude AI (tool follow-up)');
  }

  if (response.stop_reason === 'refusal') {
    throw new ClaudeRefusalError();
  }

  return {
    text: getResponseText(response),
    recommendedProducts,
    toolRounds,
    response,
  };
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

  // ── 1. Pre-flight: rate-limit cooldown check ──
  if (Date.now() < quotaBlockedUntil) {
    const retryAfterSeconds = Math.max(1, Math.ceil((quotaBlockedUntil - Date.now()) / 1000));
    if (retryAfterSeconds > 1) {
      logger.info({ retryAfterSeconds }, 'Rate-limit cooldown active, rejecting early');
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

  // ── 2. Idempotency check ──
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

  // ── 3. Validate an attached image before spending anything ──
  let imageMediaType: ReturnType<typeof toClaudeImageMediaType>;
  if (params.imageBase64) {
    imageMediaType = toClaudeImageMediaType(params.imageMimeType);
    if (!imageMediaType) {
      throw new HttpError(getFriendlyError('unsupported_image', language), 400);
    }
  }

  try {
    // ── 4. Fetch farmer context + chat history in parallel ──
    const [farmerCtx, recentMessages] = await Promise.all([
      getFarmerContext(params.farmerId),
      ChatHistoryCache.getRecentMessages(params.sessionId, 50),
    ]);

    // ── 5. Build text-only history from DB messages ──
    const historyTurns: HistoryTurn[] = [];
    for (const msg of recentMessages) {
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;

      let text = '';
      if (typeof msg.content === 'string') {
        text = msg.content;
      } else if (msg.content && typeof msg.content === 'object') {
        const contentType = (msg.content as any).type;
        if (contentType === 'tool_call' || contentType === 'tool_result') continue;
        text = (msg.content as any).text || '';
      }

      if (!text.trim()) continue;
      historyTurns.push({ role: msg.role, text });
    }

    // The conversation sent to Claude must start with a user turn.
    while (historyTurns.length > 0 && historyTurns[0].role !== 'user') {
      historyTurns.shift();
    }

    const { contents: truncatedHistory, summary } = await truncateConversationToBudget({
      historyContents: historyTurns,
      availableTokens: HISTORY_TOKEN_BUDGET,
      summarizeOlderMessages: summarizeConversationHistory,
    });

    // ── 6-7. Ask Claude (with tool calls) ──
    const reply = await generateChatReply({
      history: truncatedHistory,
      farmerContext: farmerCtx.contextString,
      language,
      conversationSummary: summary,
      text: params.text,
      imageBase64: params.imageBase64,
      imageMediaType,
    });
    const { recommendedProducts, response } = reply;
    const responseText = reply.text || getFriendlyError('provider_error', language);

    logger.info(
      {
        sessionId: params.sessionId,
        toolRounds: reply.toolRounds,
        cacheReadTokens: response.usage.cache_read_input_tokens,
        cacheWriteTokens: response.usage.cache_creation_input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      'Claude chat response'
    );

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
    const cacheHit = (response.usage.cache_read_input_tokens ?? 0) > 0;

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
      model: CLAUDE_MODEL,
      cached: cacheHit,
      audioBase64,
      audioMimeType: audioBase64 ? 'audio/mp3' : undefined,
      wallet: walletData,
    };

  } catch (error) {
    // ── Error handling — NO persistence of failed messages ──
    if (error instanceof HttpError) throw error;

    const kind = classifyClaudeError(error);

    if (kind === 'rate_limited') {
      const retryAfterSeconds = Math.min(getRetryAfterSeconds(error, 10), 15);
      quotaBlockedUntil = Date.now() + retryAfterSeconds * 1000;
      logger.warn(
        { retryAfterSeconds, blockedUntil: new Date(quotaBlockedUntil).toISOString() },
        'Claude rate limit hit'
      );
      throw new HttpError(getQuotaExceededMessage(language, retryAfterSeconds), 429, { retryAfterSeconds });
    }

    if (kind === 'unavailable') {
      logger.warn({ err: error, sessionId: params.sessionId }, 'Claude temporarily unavailable');
      throw new HttpError(getFriendlyError('provider_unavailable', language), 503);
    }

    const isRefusal = error instanceof ClaudeRefusalError;
    const isBadRequest = error instanceof Anthropic.BadRequestError;
    const code = kind === 'timeout' ? 'timeout' : isRefusal ? 'safety' : 'provider_error';
    const statusCode = kind === 'timeout' ? 504 : isRefusal || isBadRequest ? 400 : 500;

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
          model: CLAUDE_MODEL,
          modelVersion: CLAUDE_MODEL,
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
