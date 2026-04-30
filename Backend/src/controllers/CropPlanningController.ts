import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CropPlanningService } from '../services/CropPlanningService';
import { CropPlan } from '../models/CropPlan';
import { logger } from '../utils/logger';
import { createAdminLog } from '../services/adminLogService';

const GeneratePlanSchema = z.object({
  crop: z.string(),
  location: z.object({
    state: z.string(),
    district: z.string(),
  }),
  landSize: z.string(),
  soilType: z.string().optional(),
  waterAvailability: z.enum(['low', 'medium', 'high']),
  budget: z.string().optional(),
  farmingType: z.enum(['organic', 'traditional', 'hybrid']),
});

export class CropPlanningController {
  static async generatePlan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?._id;
      const body = GeneratePlanSchema.parse(request.body);

      logger.info({ userId, crop: body.crop }, 'Generating crop plan');

      const prompt = [
        `Crop: ${body.crop}`,
        `Location: ${body.location.district}, ${body.location.state}`,
        `Land Size: ${body.landSize}`,
        `Soil Type: ${body.soilType || 'Not specified'}`,
        `Water Availability: ${body.waterAvailability}`,
        `Budget: ${body.budget || 'Standard'}`,
        `Farming Type: ${body.farmingType}`
      ].join(' | ');

      const generatedPlan = await CropPlanningService.generatePlan(body);
      const responseText = JSON.stringify(generatedPlan);
      const tokenUsage = Math.ceil((prompt.length + responseText.length) / 4);

      const cropPlan = await CropPlan.create({
        userId,
        crop: body.crop,
        location: body.location,
        inputData: {
          landSize: body.landSize,
          soilType: body.soilType,
          waterAvailability: body.waterAvailability,
          budget: body.budget,
          farmingType: body.farmingType,
        },
        generatedPlan,
        prompt,
        responseText,
        feedback: 'unrated',
        tokenUsage
      });

      return reply.send({
        success: true,
        data: cropPlan,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: error.errors });
      }
      logger.error({ error: error.message }, 'CropPlan Controller error');
      await createAdminLog('ai_failure', 'Crop plan generation failed', {
        userId: request.user ? String(request.user._id) : null,
        error: error.message
      });
      return reply.status(500).send({ success: false, error: error.message });
    }
  }

  static async getUserPlans(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?._id;
      const plans = await CropPlan.find({ userId }).sort({ createdAt: -1 });
      return reply.send({ success: true, data: plans });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }

  static async getPlanById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user?._id;
      const plan = await CropPlan.findOne({ _id: id, userId });
      
      if (!plan) {
        return reply.status(404).send({ success: false, error: 'Plan not found' });
      }

      return reply.send({ success: true, data: plan });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }
}
