import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CropPlan } from '../models/CropPlan';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';
import { createAdminLog } from '../services/adminLogService';

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  location: z.string().optional(),
  crop: z.string().optional(),
  activity: z.enum(['24h', '7d', 'inactive', 'blocked']).optional()
});

const statusSchema = z.object({
  status: z.enum(['active', 'blocked'])
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getLocationText = (location?: {
  district?: string;
  state?: string;
  address?: string;
}): string => {
  if (!location) return '';
  const parts = [location.district, location.state].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return location.address ?? '';
};

export async function listAdminUsers(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listUsersQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, search, location, crop, activity } = parsed.data;
  const filters: Record<string, unknown>[] = [];

  if (search?.trim()) {
    const regex = { $regex: escapeRegex(search.trim()), $options: 'i' };
    filters.push({
      $or: [{ name: regex }, { phone: regex }]
    });
  }

  if (location?.trim()) {
    const regex = { $regex: escapeRegex(location.trim()), $options: 'i' };
    filters.push({
      $or: [{ 'location.state': regex }, { 'location.district': regex }, { 'location.address': regex }]
    });
  }

  if (crop?.trim()) {
    filters.push({ crops: { $regex: escapeRegex(crop.trim()), $options: 'i' } });
  }

  if (activity) {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (activity === '24h') {
      filters.push({ status: { $ne: 'blocked' }, lastActiveAt: { $gte: dayAgo } });
    } else if (activity === '7d') {
      filters.push({ status: { $ne: 'blocked' }, lastActiveAt: { $gte: weekAgo } });
    } else if (activity === 'inactive') {
      filters.push({
        status: { $ne: 'blocked' },
        $or: [{ lastActiveAt: { $lt: weekAgo } }, { lastActiveAt: { $exists: false } }]
      });
    } else if (activity === 'blocked') {
      filters.push({ status: 'blocked' });
    }
  }

  const where = filters.length ? { $and: filters } : {};
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(where).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(where)
  ]);

  const userIds = users.map((user) => user._id);
  const plansByUserRaw = userIds.length
    ? await CropPlan.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ])
    : [];
  const plansByUser = new Map(plansByUserRaw.map((row) => [String(row._id), Number(row.count)]));

  return reply.send({
    items: users.map((user) => ({
      id: String(user._id),
      name: user.name ?? '',
      phone: user.phone,
      location: getLocationText(user.location),
      crops: user.crops ?? [],
      status: user.status ?? 'active',
      lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : new Date(user.updatedAt).toISOString(),
      plansGenerated: plansByUser.get(String(user._id)) ?? 0,
      createdAt: new Date(user.createdAt).toISOString()
    })),
    pagination: buildPagination(page, limit, total)
  });
}

export async function getAdminUserById(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const user = await User.findById(request.params.userId).lean();
  if (!user) {
    throw AppError.notFound('errNotFound', 'User not found');
  }

  const plansGenerated = await CropPlan.countDocuments({ userId: user._id });

  return reply.send({
    user: {
      id: String(user._id),
      name: user.name ?? '',
      phone: user.phone,
      location: getLocationText(user.location),
      district: user.location?.district,
      state: user.location?.state,
      crops: user.crops ?? [],
      status: user.status ?? 'active',
      lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : new Date(user.updatedAt).toISOString(),
      plansGenerated,
      createdAt: new Date(user.createdAt).toISOString()
    }
  });
}

export async function updateAdminUserStatus(
  request: FastifyRequest<{ Params: { userId: string }; Body: { status: 'active' | 'blocked' } }>,
  reply: FastifyReply
) {
  const parsed = statusSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const user = await User.findByIdAndUpdate(
    request.params.userId,
    { $set: { status: parsed.data.status, lastActiveAt: new Date() } },
    { new: true }
  );
  if (!user) {
    throw AppError.notFound('errNotFound', 'User not found');
  }

  await createAdminLog('system', 'User status updated by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    userId: String(user._id),
    status: parsed.data.status
  });

  return reply.send({ message: `User ${parsed.data.status === 'blocked' ? 'blocked' : 'unblocked'} successfully` });
}

export async function deleteAdminUser(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const user = await User.findByIdAndDelete(request.params.userId);
  if (!user) {
    throw AppError.notFound('errNotFound', 'User not found');
  }

  await Promise.all([CropPlan.deleteMany({ userId: user._id }), Notification.deleteMany({ userId: user._id })]);

  await createAdminLog('system', 'User deleted by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    userId: String(user._id)
  });

  return reply.send({ message: 'User deleted successfully' });
}

