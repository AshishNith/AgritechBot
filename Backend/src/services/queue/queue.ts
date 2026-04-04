import { Queue, QueueEvents } from 'bullmq';
import { redis, redisSub } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

// ── Job Data Interfaces ──

export interface ChatJobData {
  userId: string;
  chatId: string;
  message: string;
  language: string;
  chatHistory?: Array<{ role: string; content: string }>;
}

export interface VoiceJobData {
  userId: string;
  chatId: string;
  audioBase64: string;
  language?: string;
  mimeType?: string;
  fileName?: string;
}

// ── Queue Configuration ──

/**
 * Optimized default job options for 10k concurrent users.
 *
 * - attempts: 3 → retry on transient LLM/network failures
 * - backoff: exponential starting at 1s → avoids retry storms
 * - removeOnComplete: keep last 500 → prevent Redis memory bloat
 * - removeOnFail: keep last 200 → enough for debugging
 * - timeout: 45s → hard limit per job (LLM calls can hang)
 */
const CHAT_JOB_DEFAULTS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: { count: 500, age: 3600 }, // Keep max 500, max 1 hour
  removeOnFail: { count: 200, age: 86400 },    // Keep max 200, max 24 hours
  timeout: 45_000,
};

const VOICE_JOB_DEFAULTS = {
  attempts: 2,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { count: 300, age: 3600 },
  removeOnFail: { count: 100, age: 86400 },
  timeout: 60_000, // Voice pipeline (STT + LLM + TTS) takes longer
};

// ── Queues ──

let chatQueueInstance: Queue<ChatJobData> | null = null;
let voiceQueueInstance: Queue<VoiceJobData> | null = null;

// ── Queue Events (for waitUntilFinished) ──

let chatQueueEventsInstance: QueueEvents | null = null;
let voiceQueueEventsInstance: QueueEvents | null = null;
let weatherQueueInstance: Queue<any> | null = null;

export function isQueueAvailable(): boolean {
  return redis.status === 'ready';
}

export function getChatQueue(): Queue<ChatJobData> {
  if (!chatQueueInstance) {
    chatQueueInstance = new Queue<ChatJobData>('chat-processing', {
      connection: redis,
      defaultJobOptions: CHAT_JOB_DEFAULTS,
    });
  }
  return chatQueueInstance;
}

export function getVoiceQueue(): Queue<VoiceJobData> {
  if (!voiceQueueInstance) {
    voiceQueueInstance = new Queue<VoiceJobData>('voice-processing', {
      connection: redis,
      defaultJobOptions: VOICE_JOB_DEFAULTS,
    });
  }
  return voiceQueueInstance;
}

export function getWeatherQueue(): Queue<any> {
  if (!weatherQueueInstance) {
    weatherQueueInstance = new Queue('weather-monitoring', {
      connection: redis,
    });
  }
  return weatherQueueInstance;
}

export function getChatQueueEvents(): QueueEvents {
  if (!chatQueueEventsInstance) {
    chatQueueEventsInstance = new QueueEvents('chat-processing', { connection: redisSub });
  }
  return chatQueueEventsInstance;
}

export function getVoiceQueueEvents(): QueueEvents {
  if (!voiceQueueEventsInstance) {
    voiceQueueEventsInstance = new QueueEvents('voice-processing', { connection: redisSub });
  }
  return voiceQueueEventsInstance;
}

// ── Job Producers ──

/**
 * Add a chat job to the queue.
 * Premium users get higher priority (lower number = higher priority).
 */
export async function addChatJob(
  data: ChatJobData,
  options?: { priority?: number }
): Promise<string> {
  const job = await getChatQueue().add('process-chat', data, {
    priority: options?.priority ?? 5,
  });
  logger.debug({ jobId: job.id, userId: data.userId }, 'Chat job queued');
  return job.id!;
}

export async function addVoiceJob(
  data: VoiceJobData,
  options?: { priority?: number }
): Promise<string> {
  const job = await getVoiceQueue().add('process-voice', data, {
    priority: options?.priority ?? 5,
  });
  logger.debug({ jobId: job.id, userId: data.userId }, 'Voice job queued');
  return job.id!;
}

// ── Queue Health Monitoring ──

export interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export async function getQueueHealth(): Promise<QueueHealth[]> {
  if (!isQueueAvailable()) {
    return [
      {
        name: 'chat-processing',
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: true,
      },
      {
        name: 'voice-processing',
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: true,
      },
    ];
  }

  const chatQueue = getChatQueue();
  const voiceQueue = getVoiceQueue();
  const [chatCounts, voiceCounts, chatPaused, voicePaused] = await Promise.all([
    chatQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    voiceQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    chatQueue.isPaused(),
    voiceQueue.isPaused(),
  ]);

  return [
    {
      name: 'chat-processing',
      waiting: chatCounts.waiting,
      active: chatCounts.active,
      completed: chatCounts.completed,
      failed: chatCounts.failed,
      delayed: chatCounts.delayed,
      paused: chatPaused,
    },
    {
      name: 'voice-processing',
      waiting: voiceCounts.waiting,
      active: voiceCounts.active,
      completed: voiceCounts.completed,
      failed: voiceCounts.failed,
      delayed: voiceCounts.delayed,
      paused: voicePaused,
    },
  ];
}

/**
 * Drain all queues — use only in testing or maintenance.
 */
export async function drainQueues(): Promise<void> {
  await Promise.all([getChatQueue().drain(), getVoiceQueue().drain()]);
  logger.warn('All queues drained');
}

/**
 * Adds a repeatable job for weather monitoring (e.g. every hour)
 */
export async function addRepeatableWeatherJob(): Promise<void> {
  const queue = getWeatherQueue();
  
  // Remove existing repeatable jobs for this name to avoid duplicates
  const repeatableJobs = await queue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === 'monitor-crops-weather') {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  await queue.add('monitor-crops-weather', {}, {
    repeat: {
      pattern: '0 * * * *', // Every hour at minute 0
    }
  });
  
  logger.info('Scheduled repeatable weather monitoring job (every hour)');
}
