import { FastifyRequest, FastifyReply } from 'fastify';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ImageAnalysis } from '../models/ImageAnalysis';
import { incrementUsage } from '../services/subscriptionService';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { DIAGNOSIS_PROMPT } from '../chat/data/diagnosisPrompt';
import { randomUUID } from 'crypto';
import { cloudinaryService } from '../services/cloudinaryService';
import { getWallet, deductCredit } from '../services/walletService';

import {
  assertNotRefused,
  createMessage,
  classifyClaudeError,
  ClaudeRefusalError,
  CLAUDE_MODEL,
  getResponseText,
  toClaudeImageMediaType,
} from '../services/ai/claudeClient';

const CROP_SCAN_TIMEOUT_MS = 75_000;

/**
 * Shape of the diagnosis the mobile app renders (ImageScanScreen). Enforced with
 * structured outputs so the app always receives these exact keys and types.
 * `severity` stays in English (Low/Moderate/High): the app colours the badge from it.
 */
const DIAGNOSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    crop: { type: 'string' },
    problem: { type: 'string' },
    confidence: { type: 'integer' },
    severity: { type: 'string', enum: ['Low', 'Moderate', 'High'] },
    severityScore: { type: 'integer' },
    summary: { type: 'string' },
    recommendations: {
      type: 'object',
      properties: {
        immediate: { type: 'array', items: { type: 'string' } },
        organic: { type: 'array', items: { type: 'string' } },
        chemical: { type: 'array', items: { type: 'string' } },
      },
      required: ['immediate', 'organic', 'chemical'],
      additionalProperties: false,
    },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          purpose: { type: 'string' },
        },
        required: ['name', 'category', 'purpose'],
        additionalProperties: false,
      },
    },
    expertHelp: { type: 'string' },
  },
  required: [
    'crop',
    'problem',
    'confidence',
    'severity',
    'severityScore',
    'summary',
    'recommendations',
    'products',
    'expertHelp',
  ],
  additionalProperties: false,
} as const;

/**
 * Sends a crop photo to Claude and returns the diagnosis as a JSON string matching
 * DIAGNOSIS_JSON_SCHEMA. No database or wallet side effects.
 */
export async function runCropDiagnosis(
  imageBase64: string,
  mediaType: NonNullable<ReturnType<typeof toClaudeImageMediaType>>,
  language: string
): Promise<string> {
  const prompt = `Identify the crop and analyze its health.
Focus strictly on identifying any visible problems like diseases, pests, or nutrient deficiencies.
If a problem is found, describe the symptoms precisely and suggest professional solutions.
Write every text value (problem, summary, recommendations, products, expertHelp) in ${language}.
Keep "severity" as exactly one of the English words Low, Moderate or High.
"confidence" and "severityScore" are whole numbers from 0 to 100.
Ensure the tone follows the Krishi persona: helpful, expert, and professional.`;

  const aiResponse = await createMessage(
    {
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: DIAGNOSIS_JSON_SCHEMA },
      },
      system: DIAGNOSIS_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64.replace(/\s/g, '') },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    },
    { timeout: CROP_SCAN_TIMEOUT_MS }
  );

  assertNotRefused(aiResponse);
  if (aiResponse.stop_reason === 'max_tokens') {
    throw new Error('Crop analysis response was cut off (max_tokens)');
  }

  return getResponseText(aiResponse);
}

// Valid image MIME types
const VALID_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

// Max image size: 5MB in base64
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Validate base64 format - handles both raw base64 and data URLs
function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) return false;

  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  let base64Data = str;
  if (str.includes(',')) {
    base64Data = str.split(',')[1] || '';
  }

  // Empty after prefix removal
  if (base64Data.length === 0) return false;

  // Basic character check (allow some flexibility for whitespace/newlines)
  const cleanData = base64Data.replace(/\s/g, '');

  // Check valid base64 characters
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanData)) {
    return false;
  }

  // Length should be multiple of 4 (with padding)
  return cleanData.length % 4 === 0;
}

// Zod schema for crop analysis request - with lenient validation
const analyzeCropSchema = z.object({
  imageBase64: z
    .string()
    .min(100, 'Image data too small') // At least 100 chars for any valid image
    .max(MAX_IMAGE_SIZE, 'Image exceeds 5MB limit'),
  imageMimeType: z
    .string()
    .optional()
    .refine((val) => !val || VALID_IMAGE_MIME_TYPES.has(val), {
      message: 'Invalid MIME type. Allowed: jpeg, png, gif, webp, bmp',
    }),
  language: z.enum(['English', 'Hindi', 'Gujarati', 'Punjabi']).optional(),
});

export const analyzeCrop = async (request: FastifyRequest, reply: FastifyReply) => {
  // Log incoming request for debugging
  const bodySize = JSON.stringify(request.body || {}).length;
  logger.info({ bodySize }, 'Image analysis request received');

  // Validate request body with Zod
  const parseResult = analyzeCropSchema.safeParse(request.body);
  if (!parseResult.success) {
    logger.warn({ errors: parseResult.error.flatten() }, 'Image analysis validation failed');
    return reply.status(400).send({
      error: 'Validation failed',
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { imageBase64, imageMimeType, language = 'English' } = parseResult.data;

  // Clean the base64 data (remove data URL prefix if present)
  let cleanBase64 = imageBase64;
  if (imageBase64.includes(',')) {
    cleanBase64 = imageBase64.split(',')[1] || imageBase64;
  }

  try {
    const userId = request.user!._id;
    const startTime = Date.now();

    // 1. CREDIT CHECK GATE
    try {
      const wallet = await getWallet(userId.toString());
      const hasCredits = (type: 'chat' | 'scan') => {
        if (type === 'chat') return (wallet.chatCredits || 0) + (wallet.topupCredits || 0) > 0;
        return (wallet.imageCredits || 0) + (wallet.topupImageCredits || 0) > 0;
      };

      if (!hasCredits('scan')) {
        logger.warn({ userId }, 'Image analysis blocked: Insufficient credits');
        return reply.status(402).send({
          error: 'INSUFFICIENT_CREDITS',
          message: 'You have run out of scan credits. Please top up to continue.',
          upgradeRequired: true
        });
      }
    } catch (walletErr) {
      if (typeof walletErr === 'object' && walletErr !== null && (walletErr as any).status === 402) {
        throw walletErr; // Propagate 402 if it came from getWallet (unlikely but possible)
      }
      logger.error({ userId, err: walletErr }, 'Failed to verify credits before analysis');
      return reply.status(500).send({ error: 'Failed to verify account balance' });
    }

    const mediaType = toClaudeImageMediaType(imageMimeType);
    if (!mediaType) {
      return reply.status(400).send({
        success: false,
        code: 'errUnknown',
        message: 'Unsupported image format. Please use a JPEG, PNG or WebP photo.',
      });
    }

    let diagnosisJson = await runCropDiagnosis(cleanBase64, mediaType, language);

    // Log for debugging
    logger.info({ userId, duration: Date.now() - startTime }, 'AI Analysis complete, processing response');

    let updatedWallet: any = null;

    // Sanitize and Extract JSON response
    try {
      const startIdx = diagnosisJson.indexOf('{');
      const endIdx = diagnosisJson.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        diagnosisJson = diagnosisJson.substring(startIdx, endIdx + 1);
      }
    } catch (e) {
      logger.warn('Failed to sanitize JSON response structure');
    }

    // Fallback for empty or invalid diagnosis to prevent Mongoose Validation Error
    if (!diagnosisJson || diagnosisJson.trim() === '' || diagnosisJson === '{}') {
      logger.warn({ userId }, 'AI returned empty diagnosis; using fallback');
      diagnosisJson = JSON.stringify({
        crop: "Unknown",
        problem: "Analysis Unavailable",
        confidence: 0,
        severity: "Low",
        severityScore: 0,
        summary: "The AI was unable to process this image clearly. Please ensure the crop is well-lit and clearly visible in the photo.",
        recommendations: { immediate: ["Try taking a clearer photo"], organic: [], chemical: [] },
        products: [],
        expertHelp: "If the problem persists, please contact a local agricultural expert."
      });
    }

    // Upload to Cloudinary for permanent storage
    const uploadResult = await cloudinaryService.uploadImage(cleanBase64, `anaaj-ai/scans/${userId}`);
    const imageUrl = uploadResult?.url;

    const analysisId = randomUUID();

    // Save the analysis when Mongo is available
    try {
      const analysis = await ImageAnalysis.create({
        userId,
        imageUri: imageUrl, // Store Cloudinary URL
        diagnosis: diagnosisJson,
        status: 'completed',
        metadata: {
          processingTimeMs: Date.now() - startTime,
          modelVersion: CLAUDE_MODEL,
          language,
          isStructured: true,
          cloudinaryPublicId: uploadResult?.publicId,
        },
      });

      logger.info({ analysisId: analysis._id, userId }, 'Analysis saved to database');

      // ✅ UNIFIED USAGE & WALLET SYNC
      try {
        const [walletResult] = await Promise.all([
          deductCredit(userId.toString(), 'scan'),
          incrementUsage(userId.toString(), 'scan')
        ]);
        updatedWallet = walletResult;
        logger.info({ userId, analysisId: analysis._id }, 'Scan credits deducted and usage incremented');
      } catch (usageError) {
        // If it throws NO_CREDITS here, it means credits were consumed between our check and now
        if (typeof usageError === 'object' && usageError !== null && (usageError as any).code === 'NO_CREDITS') {
          return reply.status(402).send({ error: 'NO_CREDITS', upgradeRequired: true });
        }
        logger.error({ err: usageError, userId }, 'Failed to increment usage or sync wallet');
      }

      return reply.send({
        id: analysis._id,
        diagnosis: JSON.parse(diagnosisJson), // Return as object for easier UI consumption if it was stringified
        imageUrl: imageUrl, // Return Cloudinary URL to frontend
        isStructured: true,
        createdAt: analysis.createdAt,
        wallet: updatedWallet ? {
          imageCredits: updatedWallet.imageCredits,
          topupImageCredits: updatedWallet.topupImageCredits,
          totalRemaining: updatedWallet.imageCredits + updatedWallet.topupImageCredits,
        } : undefined,
      });
    } catch (saveError) {
      logger.warn({ err: saveError, userId }, 'Analysis completed but failed to save to MongoDB; returning diagnosis anyway');
      return reply.send({
        id: analysisId,
        diagnosis: diagnosisJson,
        isStructured: true,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Map Claude API errors to the status codes the mobile app already handles
    let statusCode = 500;
    let errorMessage = 'Failed to analyze crop image';
    const kind = classifyClaudeError(error);

    if (error instanceof ClaudeRefusalError) {
      statusCode = 403;
      errorMessage = 'Image could not be processed due to safety restrictions.';
    } else if (error instanceof Anthropic.BadRequestError) {
      statusCode = 400;
      errorMessage = 'Invalid image format or data. Please try a different image.';
    } else if (kind === 'rate_limited') {
      statusCode = 429;
      errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
    } else if (kind === 'timeout') {
      statusCode = 504;
      errorMessage = 'Image analysis timed out. Please try with a smaller image.';
    } else if (kind === 'unavailable') {
      statusCode = 503;
      errorMessage = 'AI Server is currently experiencing high demand. Please try again in 2 minutes.';
    }

    logger.error({ err: error, statusCode }, 'Crop analysis failed');
    return reply.status(statusCode).send({ 
      success: false, 
      code: statusCode === 503 || statusCode === 429 ? 'errServerBusy' : 'errUnknown', 
      message: errorMessage 
    });
  }
};

export const getAnalysisHistory = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;

  try {
    const history = await ImageAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Format response for mobile clients
    const formattedHistory = history.map((item) => ({
      _id: item._id,
      imageUri: item.imageUri, // High-res Cloudinary URL
      thumbnailUrl: null, // No longer storing/returning thumbnails to save DB space
      diagnosis: item.diagnosis,
      status: item.status,
      createdAt: item.createdAt,
      metadata: {
        ...item.metadata,
        language: item.metadata?.language,
        cropType: item.cropType, // Take from top-level
      },
    }));

    return reply.send({ history: formattedHistory });
  } catch (error) {
    logger.warn({ err: error, userId }, 'Analysis history unavailable; returning empty history');
    return reply.send({ history: [] });
  }
};
