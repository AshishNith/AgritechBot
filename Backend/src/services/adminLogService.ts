import { AdminLog, type AdminLogType } from '../models/AdminLog';
import { logger } from '../utils/logger';

export async function createAdminLog(
  type: AdminLogType,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    await AdminLog.create({
      type,
      message,
      timestamp: new Date(),
      meta
    });
  } catch (error) {
    logger.error({ err: error, type, message }, 'Failed to create admin log');
  }
}

