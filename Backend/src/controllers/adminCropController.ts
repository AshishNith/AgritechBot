import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Crop } from '../models/Crop';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';
import { createAdminLog } from '../services/adminLogService';

const cropQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional()
});

const cropBodySchema = z.object({
  name: z.string().min(1).max(120),
  soilType: z.string().min(1).max(120),
  climate: z.string().min(1).max(120),
  growthStages: z.array(z.string().min(1)).default([]),
  schedule: z.array(z.string().min(1)).default([])
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listAdminCrops(request: FastifyRequest, reply: FastifyReply) {
  const parsed = cropQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;
  const where = search?.trim()
    ? {
        $or: [
          { name: { $regex: escapeRegex(search.trim()), $options: 'i' } },
          { soilType: { $regex: escapeRegex(search.trim()), $options: 'i' } },
          { climate: { $regex: escapeRegex(search.trim()), $options: 'i' } }
        ]
      }
    : {};

  const [crops, total] = await Promise.all([
    Crop.find(where).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Crop.countDocuments(where)
  ]);

  return reply.send({
    items: crops.map((crop) => ({
      id: String(crop._id),
      name: crop.name,
      soilType: crop.soilType,
      climate: crop.climate,
      growthStages: crop.growthStages ?? [],
      schedule: crop.schedule ?? [],
      createdAt: new Date(crop.createdAt).toISOString()
    })),
    pagination: buildPagination(page, limit, total)
  });
}

export async function createAdminCrop(request: FastifyRequest, reply: FastifyReply) {
  const parsed = cropBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const payload = {
    ...parsed.data,
    name: parsed.data.name.trim(),
    soilType: parsed.data.soilType.trim(),
    climate: parsed.data.climate.trim(),
    growthStages: parsed.data.growthStages.map((item) => item.trim()).filter(Boolean),
    schedule: parsed.data.schedule.map((item) => item.trim()).filter(Boolean)
  };

  const existing = await Crop.findOne({ name: new RegExp(`^${escapeRegex(payload.name)}$`, 'i') });
  if (existing) {
    throw AppError.badRequest('errInvalidInput', 'Crop name already exists');
  }

  const crop = await Crop.create(payload);
  await createAdminLog('system', 'Crop created by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    cropId: String(crop._id),
    cropName: crop.name
  });

  return reply.status(201).send({
    message: 'Crop created successfully',
    crop: {
      id: String(crop._id),
      name: crop.name,
      soilType: crop.soilType,
      climate: crop.climate,
      growthStages: crop.growthStages ?? [],
      schedule: crop.schedule ?? [],
      createdAt: crop.createdAt.toISOString()
    }
  });
}

export async function updateAdminCrop(
  request: FastifyRequest<{ Params: { cropId: string } }>,
  reply: FastifyReply
) {
  const parsed = cropBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const normalizedPayload = {
    ...parsed.data,
    name: parsed.data.name.trim(),
    soilType: parsed.data.soilType.trim(),
    climate: parsed.data.climate.trim(),
    growthStages: parsed.data.growthStages.map((item) => item.trim()).filter(Boolean),
    schedule: parsed.data.schedule.map((item) => item.trim()).filter(Boolean)
  };

  const duplicate = await Crop.findOne({
    _id: { $ne: request.params.cropId },
    name: new RegExp(`^${escapeRegex(normalizedPayload.name)}$`, 'i')
  });
  if (duplicate) {
    throw AppError.badRequest('errInvalidInput', 'Crop name already exists');
  }

  const crop = await Crop.findByIdAndUpdate(request.params.cropId, normalizedPayload, { new: true });
  if (!crop) {
    throw AppError.notFound('errNotFound', 'Crop not found');
  }

  await createAdminLog('system', 'Crop updated by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    cropId: String(crop._id)
  });

  return reply.send({
    message: 'Crop updated successfully',
    crop: {
      id: String(crop._id),
      name: crop.name,
      soilType: crop.soilType,
      climate: crop.climate,
      growthStages: crop.growthStages ?? [],
      schedule: crop.schedule ?? [],
      createdAt: crop.createdAt.toISOString()
    }
  });
}

export async function deleteAdminCrop(
  request: FastifyRequest<{ Params: { cropId: string } }>,
  reply: FastifyReply
) {
  const crop = await Crop.findByIdAndDelete(request.params.cropId);
  if (!crop) {
    throw AppError.notFound('errNotFound', 'Crop not found');
  }

  await createAdminLog('system', 'Crop deleted by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    cropId: String(crop._id)
  });

  return reply.send({ message: 'Crop deleted successfully' });
}

