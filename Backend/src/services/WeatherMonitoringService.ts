import { UserCrop } from '../models/UserCrop';
import { FarmingAdvisorService } from './farmingAdvisor.service';
import { logger } from '../utils/logger';

export class WeatherMonitoringService {
  static async monitorAllCrops() {
    logger.info('Starting weather monitoring cycle for active crops');

    const crops = await UserCrop.find({ isActive: true, assistantEnabled: true }).select('userId').lean();
    const uniqueUserIds = [...new Set(crops.map((crop) => String(crop.userId)))];

    for (const userId of uniqueUserIds) {
      await FarmingAdvisorService.syncUser(userId);
    }

    logger.info({ userCount: uniqueUserIds.length }, 'Weather monitoring cycle completed');
  }
}
