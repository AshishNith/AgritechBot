import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CropPlan } from '../models/CropPlan';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';
import { CropPlanningService } from '../services/CropPlanningService';
import { createAdminLog } from '../services/adminLogService';

const listPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  crop: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

const feedbackSchema = z.object({
  feedback: z.enum(['good', 'bad'])
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPrompt = (plan: {
  crop: string;
  location?: { state?: string; district?: string };
  inputData?: {
    landSize?: string;
    soilType?: string;
    waterAvailability?: string;
    budget?: string;
    farmingType?: string;
  };
}): string =>
  [
    `Crop: ${plan.crop}`,
    `Location: ${plan.location?.district ?? '-'}, ${plan.location?.state ?? '-'}`,
    `Land Size: ${plan.inputData?.landSize ?? '-'}`,
    `Soil Type: ${plan.inputData?.soilType ?? '-'}`,
    `Water Availability: ${plan.inputData?.waterAvailability ?? '-'}`,
    `Budget: ${plan.inputData?.budget ?? '-'}`,
    `Farming Type: ${plan.inputData?.farmingType ?? '-'}`
  ].join(' | ');

type PopulatedUser = {
  _id: unknown;
  name?: string;
  phone?: string;
};

function normalizePlan(plan: any) {
  const rawUser = plan.userId;
  const user =
    rawUser && typeof rawUser === 'object' && '_id' in rawUser ? (rawUser as PopulatedUser) : undefined;
  const prompt = plan.prompt || buildPrompt(plan);
  const responseText = plan.responseText || JSON.stringify(plan.generatedPlan ?? {});
  const tokenUsage = plan.tokenUsage ?? Math.ceil((prompt.length + responseText.length) / 4);

  return {
    id: String(plan._id),
    userId: user ? String(user._id) : String(rawUser),
    userName: user?.name,
    userPhone: user?.phone,
    crop: plan.crop,
    prompt,
    response: responseText,
    feedback: plan.feedback ?? 'unrated',
    tokenUsage,
    createdAt: new Date(plan.createdAt).toISOString()
  };
}

export async function listAdminPlans(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listPlansQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, crop, userId, from, to } = parsed.data;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};

  if (crop?.trim()) {
    where.crop = { $regex: escapeRegex(crop.trim()), $options: 'i' };
  }
  if (userId?.trim()) {
    where.userId = userId.trim();
  }
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).$gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).$lte = new Date(to);
  }

  const [plans, total] = await Promise.all([
    CropPlan.find(where)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CropPlan.countDocuments(where)
  ]);

  return reply.send({
    items: plans.map(normalizePlan),
    pagination: buildPagination(page, limit, total)
  });
}

export async function markPlanFeedback(
  request: FastifyRequest<{ Params: { planId: string }; Body: { feedback: 'good' | 'bad' } }>,
  reply: FastifyReply
) {
  const parsed = feedbackSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const plan = await CropPlan.findByIdAndUpdate(
    request.params.planId,
    { $set: { feedback: parsed.data.feedback } },
    { new: true }
  );
  if (!plan) {
    throw AppError.notFound('errNotFound', 'Plan not found');
  }

  await createAdminLog('system', 'Plan feedback updated', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    planId: String(plan._id),
    feedback: parsed.data.feedback
  });

  return reply.send({ message: 'Plan feedback updated successfully' });
}

export async function regeneratePlan(
  request: FastifyRequest<{ Params: { planId: string } }>,
  reply: FastifyReply
) {
  const plan = await CropPlan.findById(request.params.planId);
  if (!plan) {
    throw AppError.notFound('errNotFound', 'Plan not found');
  }

  try {
    const generatedPlan = await CropPlanningService.generatePlan({
      crop: plan.crop,
      location: {
        state: plan.location.state,
        district: plan.location.district
      },
      landSize: plan.inputData.landSize,
      soilType: plan.inputData.soilType,
      waterAvailability: plan.inputData.waterAvailability,
      budget: plan.inputData.budget,
      farmingType: plan.inputData.farmingType
    });

    const prompt = buildPrompt(plan);
    const responseText = JSON.stringify(generatedPlan);
    const tokenUsage = Math.ceil((prompt.length + responseText.length) / 4);

    plan.generatedPlan = generatedPlan;
    plan.prompt = prompt;
    plan.responseText = responseText;
    plan.feedback = 'unrated';
    plan.tokenUsage = tokenUsage;
    await plan.save();

    await createAdminLog('system', 'Plan regenerated by admin', {
      adminId: request.adminUser ? String(request.adminUser._id) : null,
      planId: String(plan._id),
      tokenUsage
    });

    return reply.send({
      message: 'Plan regenerated successfully',
      plan: normalizePlan(plan)
    });
  } catch (error) {
    await createAdminLog('ai_failure', 'Plan regeneration failed', {
      adminId: request.adminUser ? String(request.adminUser._id) : null,
      planId: String(plan._id),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw AppError.internal('errServerBusy', 'Failed to regenerate plan');
  }
}

