import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

export async function createUserNotification(params: {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: 'low' | 'medium' | 'high';
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  dedupeWindowHours?: number;
}) {
  const userId = new mongoose.Types.ObjectId(String(params.userId));
  const dedupeWindowHours = params.dedupeWindowHours ?? 6;

  if (params.dedupeKey) {
    const since = new Date(Date.now() - dedupeWindowHours * 60 * 60 * 1000);
    const existing = await Notification.findOne({
      userId,
      type: params.type,
      'metadata.dedupeKey': params.dedupeKey,
      createdAt: { $gte: since },
    }).lean();

    if (existing) {
      return existing;
    }
  }

  return Notification.create({
    userId,
    type: params.type,
    title: params.title,
    body: params.body,
    priority: params.priority ?? 'medium',
    actionLabel: params.actionLabel,
    metadata: {
      ...(params.metadata || {}),
      ...(params.dedupeKey ? { dedupeKey: params.dedupeKey } : {}),
    },
  });
}
