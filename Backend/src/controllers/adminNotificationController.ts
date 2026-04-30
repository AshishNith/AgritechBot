import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { createAdminLog } from '../services/adminLogService';

const notificationSchema = z.object({
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(1500),
  target: z
    .object({
      location: z.string().optional(),
      crop: z.string().optional(),
      broadcast: z.boolean().optional()
    })
    .default({})
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

export async function sendAdminNotification(request: FastifyRequest, reply: FastifyReply) {
  const parsed = notificationSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { title, message, target } = parsed.data;
  const query: Record<string, unknown> = { status: { $ne: 'blocked' } };
  const isBroadcast = Boolean(target.broadcast);

  if (!isBroadcast) {
    if (target.location?.trim()) {
      const regex = { $regex: escapeRegex(target.location.trim()), $options: 'i' };
      query.$or = [{ 'location.state': regex }, { 'location.district': regex }, { 'location.address': regex }];
    }

    if (target.crop?.trim()) {
      query.crops = { $regex: escapeRegex(target.crop.trim()), $options: 'i' };
    }
  }

  const users = await User.find(query).select('name location');
  if (users.length) {
    await Notification.insertMany(
      users.map((user) => ({
        userId: user._id,
        type: 'system',
        title,
        body: message,
        priority: 'high',
        read: false,
        metadata: {
          source: 'admin-dashboard',
          target: {
            broadcast: isBroadcast,
            location: target.location,
            crop: target.crop
          }
        }
      }))
    );
  }

  const recipients = users.map((user) => ({
    id: String(user._id),
    name: user.name ?? '',
    location: getLocationText(user.location)
  }));

  await createAdminLog('notification', 'Notification dispatched by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    title,
    target,
    sentCount: recipients.length
  });

  return reply.send({
    sentCount: recipients.length,
    recipients
  });
}

