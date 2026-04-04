import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { FarmingTask } from '../models/FarmingTask';
import { UserCrop } from '../models/UserCrop';
import { AISchedulingService } from '../services/AISchedulingService';
import { FarmingAdvisorService } from '../services/farmingAdvisor.service';
import { createUserNotification } from '../services/notificationService';
import { WeatherService } from '../services/WeatherService';
import { logger } from '../utils/logger';

const cropSchema = z.object({
  cropType: z.string().trim().min(1),
  variety: z.string().trim().optional(),
  plantingDate: z.string().pipe(z.coerce.date()),
  landSize: z.number().optional(),
  landUnit: z.string().optional(),
  soilType: z.string().optional(),
  currentStage: z.enum(['seedling', 'growing', 'flowering', 'fruiting', 'harvesting', 'dormant']).default('seedling'),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  assistantEnabled: z.boolean().optional().default(true),
});

const taskUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'skipped', 'missed']).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  scheduledDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  reminderMinutesBefore: z.coerce.number().min(5).max(720).optional(),
  repeat: z.enum(['none', 'daily', 'weekly']).optional(),
});

const tasksQuerySchema = z.object({
  cropId: z.string().optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  status: z.enum(['pending', 'completed', 'skipped', 'missed']).optional(),
  taskType: z.enum(['watering', 'fertilizing', 'pesticide', 'weeding', 'harvesting', 'maintenance']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export async function addCrop(request: FastifyRequest, reply: FastifyReply) {
  const parsed = cropSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;

  try {
    const crop = await UserCrop.create({
      ...parsed.data,
      userId,
    });

    const aiTasks = await AISchedulingService.generateSchedule(crop);
    const tasksToCreate = aiTasks.map((task) => ({
      userId,
      userCropId: crop._id,
      taskType: task.taskType,
      title: task.title,
      description: task.description,
      scheduledDate: new Date(Date.now() + task.daysAfterPlanting * 24 * 60 * 60 * 1000),
      status: 'pending' as const,
      priority: task.priority,
      reminderMinutesBefore: task.reminderMinutesBefore ?? 30,
      repeat: task.repeat ?? 'none',
      source: 'ai' as const,
      isManual: false,
    }));

    await FarmingTask.insertMany(tasksToCreate);

    await createUserNotification({
      userId,
      type: 'ai_suggestion',
      title: `${crop.cropType} schedule generated`,
      body: `Your AI care plan is ready with ${tasksToCreate.length} scheduled tasks.`,
      priority: 'medium',
      actionLabel: 'Open Tasks',
      metadata: {
        cropId: String(crop._id),
      },
      dedupeKey: `schedule-generated-${String(crop._id)}`,
      dedupeWindowHours: 24,
    });

    return reply.status(201).send({
      message: 'Crop added and schedule generated',
      crop,
      taskCount: tasksToCreate.length,
    });
  } catch (error: any) {
    logger.error({ error: error.message, userId }, 'Failed to add crop');
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getCrops(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!._id;
  const crops = await UserCrop.find({ userId, isActive: true }).sort({ createdAt: -1 });
  return reply.send({ crops });
}

export async function getTasks(request: FastifyRequest, reply: FastifyReply) {
  const parsed = tasksQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const query: Record<string, unknown> = { userId };

  if (parsed.data.cropId) query.userCropId = parsed.data.cropId;
  if (parsed.data.status) query.status = parsed.data.status;
  if (parsed.data.taskType) query.taskType = parsed.data.taskType;
  if (parsed.data.priority) query.priority = parsed.data.priority;
  if (parsed.data.start || parsed.data.end) {
    query.scheduledDate = {
      ...(parsed.data.start ? { $gte: new Date(parsed.data.start) } : {}),
      ...(parsed.data.end ? { $lte: new Date(parsed.data.end) } : {}),
    };
  }

  const tasks = await FarmingTask.find(query).sort({ scheduledDate: 1 });
  return reply.send({ tasks });
}

export async function updateTask(request: FastifyRequest, reply: FastifyReply) {
  const { taskId } = request.params as { taskId: string };
  const parsed = taskUpdateSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const payload: Record<string, unknown> = {};

  if (parsed.data.status) {
    payload.status = parsed.data.status;
    payload.completedAt = parsed.data.status === 'completed' ? new Date() : undefined;
  }
  if (parsed.data.title) payload.title = parsed.data.title;
  if (parsed.data.description) payload.description = parsed.data.description;
  if (parsed.data.scheduledDate) payload.scheduledDate = new Date(parsed.data.scheduledDate);
  if (parsed.data.priority) payload.priority = parsed.data.priority;
  if (parsed.data.reminderMinutesBefore != null) payload.reminderMinutesBefore = parsed.data.reminderMinutesBefore;
  if (parsed.data.repeat) payload.repeat = parsed.data.repeat;

  const task = await FarmingTask.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: payload },
    { new: true }
  );

  if (!task) {
    return reply.status(404).send({ error: 'Task not found' });
  }

  if (parsed.data.status === 'missed') {
    await createUserNotification({
      userId,
      type: 'adaptive_alert',
      title: 'Missed farming task detected',
      body: `You missed "${task.title}". Review the schedule to stay on track.`,
      priority: 'medium',
      actionLabel: 'Review Schedule',
      metadata: {
        taskId: String(task._id),
        cropId: String(task.userCropId),
      },
      dedupeKey: `missed-task-${String(task._id)}-${new Date().toISOString().slice(0, 10)}`,
    });
  }

  if (
    task &&
    parsed.data.status === 'completed' &&
    task.repeat !== 'none'
  ) {
    const nextScheduledDate = new Date(task.scheduledDate);
    if (task.repeat === 'daily') {
      nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
    } else if (task.repeat === 'weekly') {
      nextScheduledDate.setDate(nextScheduledDate.getDate() + 7);
    }

    const existingRepeat = await FarmingTask.findOne({
      userId,
      userCropId: task.userCropId,
      title: task.title,
      scheduledDate: nextScheduledDate,
      status: 'pending',
    }).lean();

    if (!existingRepeat) {
      await FarmingTask.create({
        userId,
        userCropId: task.userCropId,
        taskType: task.taskType,
        title: task.title,
        description: task.description,
        scheduledDate: nextScheduledDate,
        status: 'pending',
        aiReason: task.aiReason,
        isManual: task.isManual,
        source: task.source,
        priority: task.priority,
        reminderMinutesBefore: task.reminderMinutesBefore,
        repeat: task.repeat,
      });
    }
  }

  return reply.send({ message: 'Task updated', task });
}

export async function getCropWeather(request: FastifyRequest, reply: FastifyReply) {
  const { cropId } = request.query as { cropId?: string };
  if (!cropId) {
    return reply.status(400).send({ error: 'cropId is required' });
  }

  const userId = request.user!._id;
  const crop = await UserCrop.findOne({ _id: cropId, userId });
  if (!crop) {
    return reply.status(404).send({ error: 'Crop not found' });
  }

  const weather = await WeatherService.getWeather(crop.location.latitude, crop.location.longitude);
  return reply.send({ weather });
}

export async function syncAssistant(request: FastifyRequest, reply: FastifyReply) {
  const userId = String(request.user!._id);
  const dashboard = await FarmingAdvisorService.syncUser(userId);
  return reply.send(dashboard);
}

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  const userId = String(request.user!._id);
  const dashboard = await FarmingAdvisorService.syncUser(userId);
  return reply.send(dashboard);
}
