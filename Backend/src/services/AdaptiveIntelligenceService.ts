import { FarmingTask } from '../models/FarmingTask';
import { UserCrop } from '../models/UserCrop';
import { WeatherService } from './WeatherService';
import { AISchedulingService } from './AISchedulingService';
import { Notification } from '../models/Notification';
import { logger } from '../utils/logger';

export class AdaptiveIntelligenceService {
  /**
   * Main routine to check weather and adjust schedules.
   * Should be called periodically (e.g., every 6 hours).
   */
  static async checkAndAdjustSchedules() {
    logger.info('Starting adaptive schedule adjustment check...');

    try {
      // 1. Get all pending "watering" tasks scheduled for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const pendingWateringTasks = await FarmingTask.find({
        taskType: 'watering',
        status: 'pending',
        scheduledDate: { $gte: today, $lt: tomorrow },
      }).populate('userCropId');

      for (const task of pendingWateringTasks) {
        const crop = task.userCropId as any; // Cast to IUserCrop
        if (!crop || !crop.location) continue;

        // 2. Check if it will rain soon for this crop's location
        const willRain = await WeatherService.willRainSoon(
          crop.location.latitude,
          crop.location.longitude
        );

        if (willRain) {
          // 3. If rain predicted, get AI reason and skip the task
          const reason = await AISchedulingService.getAdjustmentReason(
            task.title,
            'Upcoming heavy rain predicted ( > 60% probability )'
          );

          task.status = 'skipped';
          task.aiReason = reason;
          await task.save();

          // 4. Notify the user
          await Notification.create({
            userId: task.userId,
            type: 'adaptive_alert',
            title: 'Schedule Adjusted: Watering Skipped',
            body: `We've skipped your "${task.title}" for ${crop.cropType} because rain is expected today. Reason: ${reason}`,
            metadata: { taskId: task._id, cropId: crop._id },
          });

          logger.info({ taskId: task._id, userId: task.userId }, 'Watering task skipped due to rain prediction');
        }
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Adaptive intelligence check failed');
    }
  }

  /**
   * Check for extreme weather events and send alerts
   */
  static async checkExtremeWeatherAlerts() {
    try {
      const activeCrops = await UserCrop.find({ isActive: true });
      // To avoid duplicate alerts for same location, we could group by location
      // But for simplicity, we'll iterate
      
      for (const crop of activeCrops) {
        const weather = await WeatherService.getWeather(
          crop.location.latitude,
          crop.location.longitude
        );

        if (weather && weather.alerts && weather.alerts.length > 0) {
          for (const alert of weather.alerts) {
            await Notification.create({
              userId: crop.userId,
              type: 'weather',
              title: `Weather Alert: ${alert.event}`,
              body: alert.description,
              metadata: { severity: alert.severity, cropId: crop._id },
            });
          }
        }
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Extreme weather alert check failed');
    }
  }
}
