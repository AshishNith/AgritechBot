import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ImageAnalysis } from '../models/ImageAnalysis';
import { incrementUsage } from '../services/subscriptionService';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { DIAGNOSIS_PROMPT } from '../chat/data/diagnosisPrompt';
import { randomUUID } from 'crypto';
import { cloudinaryService } from '../services/cloudinaryService';
import { getWallet } from '../services/walletService';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

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

    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: DIAGNOSIS_PROMPT,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1, // Even lower for stability
        topP: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze this crop image and return a structured diagnosis in JSON format. 
    CRITICAL: YOU MUST RESPOND IN ${language.toUpperCase()}. 
    All string values in the JSON (problem, summary, recommendations, products, expertHelp) MUST be translated into ${language}.
    Ensure the tone follows the Krishi persona: helpful, expert, and professional.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64, // Use cleaned base64 without data URL prefix
        },
      },
    ]);

    const response = await result.response;
    let diagnosisJson = response.text();
    
    // Log for debugging
    logger.info({ userId, duration: Date.now() - startTime }, 'AI Analysis complete, processing response');

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
          modelVersion: env.GEMINI_MODEL,
          language,
          isStructured: true,
          cloudinaryPublicId: uploadResult?.publicId,
        },
      });

      logger.info({ analysisId: analysis._id, userId }, 'Analysis saved to database');
      
      // ✅ UNIFIED USAGE & WALLET SYNC
      try {
        await incrementUsage(userId.toString(), 'scan');
        logger.info({ userId, analysisId: analysis._id }, 'Scan usage incremented and wallet synced');
      } catch (usageError) {
        // If it throws NO_CREDITS here, it means credits were consumed between our check and now
        if (typeof usageError === 'object' && usageError !== null && (usageError as any).code === 'NO_CREDITS') {
           return reply.status(402).send({ error: 'NO_CREDITS', upgradeRequired: true });
        }
        logger.error({ err: usageError, userId }, 'Failed to increment usage or sync wallet');
      }

      return reply.send({
        id: analysis._id,
        diagnosis: diagnosisJson,
        imageUrl: imageUrl, // Return Cloudinary URL to frontend
        isStructured: true,
        createdAt: analysis.createdAt,
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
    // Differentiate Gemini API errors
    const errorStr = error instanceof Error ? error.message : String(error);
    let statusCode = 500;
    let errorMessage = 'Failed to analyze crop image';

    if (errorStr.includes('INVALID_ARGUMENT') || errorStr.includes('Invalid')) {
      statusCode = 400;
      errorMessage = 'Invalid image format or data. Please try a different image.';
    } else if (errorStr.includes('SAFETY') || errorStr.includes('BLOCKED')) {
      statusCode = 403;
      errorMessage = 'Image could not be processed due to safety restrictions.';
    } else if (errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
      statusCode = 429;
      errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
    } else if (errorStr.includes('DEADLINE_EXCEEDED') || errorStr.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Image analysis timed out. Please try with a smaller image.';
    }

    logger.error({ err: error, statusCode }, 'Crop analysis failed');
    return reply.status(statusCode).send({ error: errorMessage });
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
