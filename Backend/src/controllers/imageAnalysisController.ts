import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageAnalysis } from '../models/ImageAnalysis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { SYSTEM_PROMPT } from '../chat/data/systemPrompt';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const analyzeCrop = async (request: FastifyRequest, reply: FastifyReply) => {
  const { imageBase64, imageMimeType, language = 'English' } = request.body as {
    imageBase64: string;
    imageMimeType: string;
    language?: string;
  };

  if (!imageBase64) {
    return reply.status(400).send({ error: 'Image is required' });
  }

  const startTime = Date.now();
  const userId = request.user!._id;

  try {
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.4,
        topP: 0.8,
      },
    });

    const prompt = `Analyze this crop image for diseases. Provide a detailed report following the structured format defined in your persona. Language: ${language}`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const diagnosisText = response.text();

    // Basic extraction of fields (optional, can be improved with regex or better prompting)
    // For now, we store the full diagnosis.
    const analysis = await ImageAnalysis.create({
      userId,
      imageBase64: imageBase64, // Store full image for history display
      diagnosis: diagnosisText,
      status: 'completed',
      metadata: {
        processingTimeMs: Date.now() - startTime,
        modelVersion: env.GEMINI_MODEL,
        language,
      },
    });

    return reply.send({
      id: analysis._id,
      diagnosis: diagnosisText,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    logger.error({ err: error, userId }, 'Crop analysis failed');
    return reply.status(500).send({ error: 'Failed to analyze crop image' });
  }
};

export const getAnalysisHistory = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;

  try {
    const history = await ImageAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return reply.send({ history });
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to fetch analysis history');
    return reply.status(500).send({ error: 'Failed to fetch history' });
  }
};
