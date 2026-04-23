import mongoose from 'mongoose';
import { FarmingTask, IFarmingTask } from '../models/FarmingTask';
import { Notification } from '../models/Notification';
import { IUserCrop, UserCrop } from '../models/UserCrop';
import { WeatherService, WeatherData } from './WeatherService';
import { AISchedulingService } from './AISchedulingService';
import { createUserNotification } from './notificationService';

type WeatherRiskType = 'heavy_rain' | 'storm' | 'extreme_heat' | 'frost';

export interface WeatherRisk {
  type: WeatherRiskType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface CropAssistantSnapshot {
  cropId: string;
  cropType: string;
  stage: string;
  locationLabel: string;
  weather: WeatherData | null;
  risks: WeatherRisk[];
  recommendations: string[];
  analysis?: {
    status: string;
    summary: string;
    roadmap: string;
  };
}

function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function normalizeMain(condition?: string) {
  return (condition || '').toLowerCase();
}

function detectWeatherRisks(weather: WeatherData | null): WeatherRisk[] {
  if (!weather) {
    return [];
  }

  const risks: WeatherRisk[] = [];
  const main = normalizeMain(weather.condition);
  const description = normalizeMain(weather.description);

  if (main.includes('rain') || (weather.forecast?.next24hRainMm ?? 0) >= 12) {
    risks.push({
      type: 'heavy_rain',
      title: 'Heavy rain expected',
      description: 'Rainfall could cover irrigation needs and affect fertilizer timing.',
      priority: 'high',
      recommendation: 'Rain expected — skip watering today and inspect drainage channels.',
    });
  }

  if (main.includes('thunderstorm') || description.includes('storm') || weather.windSpeed >= 14) {
    risks.push({
      type: 'storm',
      title: 'Storm risk',
      description: 'Strong winds or thunderstorms may damage tender growth.',
      priority: 'high',
      recommendation: 'Storm conditions likely — delay spraying and secure vulnerable crop support.',
    });
  }

  if (weather.temp >= 38 || (weather.forecast?.maxTempNext24h ?? 0) >= 40) {
    risks.push({
      type: 'extreme_heat',
      title: 'Extreme heat alert',
      description: 'High temperatures can sharply raise evapotranspiration.',
      priority: 'high',
      recommendation: 'High temperature — increase watering frequency and avoid midday field work.',
    });
  }

  if (weather.temp <= 4 || (weather.forecast?.minTempNext24h ?? 99) <= 3) {
    risks.push({
      type: 'frost',
      title: 'Frost alert',
      description: 'Cold stress may affect flowering and sensitive leaves.',
      priority: 'high',
      recommendation: 'Frost expected — irrigate carefully before dawn and protect sensitive plants.',
    });
  }

  return risks;
}

function buildWeatherSummary(weather: WeatherData | null, risks: WeatherRisk[]) {
  if (!weather) {
    return 'Weather unavailable';
  }

  const summaryParts = [
    `${weather.condition} at ${Math.round(weather.temp)}C`,
    `humidity ${weather.humidity}%`,
    `wind ${weather.windSpeed} m/s`,
  ];

  if (risks.length > 0) {
    summaryParts.push(`risks: ${risks.map((risk) => risk.title).join(', ')}`);
  }

  return summaryParts.join(', ');
}

async function ensureAdaptiveTasks(params: {
  crop: IUserCrop;
  tasks: IFarmingTask[];
  risks: WeatherRisk[];
}) {
  const updates: Array<Promise<unknown>> = [];
  const now = new Date();
  const todayEnd = endOfDay(now);

  for (const task of params.tasks) {
    if (task.status !== 'pending') {
      continue;
    }

    const heavyRain = params.risks.find((risk) => risk.type === 'heavy_rain');
    const heatRisk = params.risks.find((risk) => risk.type === 'extreme_heat');

    if (task.taskType === 'watering' && heavyRain) {
      updates.push(
        FarmingTask.updateOne(
          { _id: task._id },
          {
            $set: {
              status: 'skipped',
              aiReason: heavyRain.recommendation,
              lastAdaptiveUpdateAt: now,
            },
          }
        )
      );

      updates.push(
        createUserNotification({
          userId: params.crop.userId,
          type: 'adaptive_alert',
          title: `Watering skipped for ${params.crop.cropType}`,
          body: heavyRain.recommendation,
          priority: 'high',
          actionLabel: 'Review Schedule',
          dedupeKey: `skip-watering-${params.crop.id}-${task.id}-${startOfDay().toISOString()}`,
          metadata: {
            cropId: String(params.crop._id),
            taskId: String(task._id),
            adaptationType: 'skip_watering',
          },
        })
      );
    }

    if (task.taskType === 'watering' && heatRisk) {
      updates.push(
        FarmingTask.updateOne(
          { _id: task._id },
          {
            $set: {
              priority: 'high',
              aiReason: heatRisk.recommendation,
              lastAdaptiveUpdateAt: now,
            },
          }
        )
      );
    }
  }

  const hasTodayAdaptiveWatering = await FarmingTask.exists({
    userCropId: params.crop._id,
    source: 'adaptive',
    scheduledDate: { $gte: startOfDay(now), $lte: todayEnd },
    status: 'pending',
  });

  const heatRisk = params.risks.find((risk) => risk.type === 'extreme_heat');
  if (heatRisk && !hasTodayAdaptiveWatering) {
    updates.push(
      FarmingTask.create({
        userCropId: params.crop._id,
        userId: params.crop.userId,
        taskType: 'watering',
        title: `Heatwave irrigation check for ${params.crop.cropType}`,
        description: 'Inspect moisture early evening and add a light irrigation cycle if soil is drying fast.',
        scheduledDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: 'pending',
        aiReason: heatRisk.recommendation,
        isManual: false,
        source: 'adaptive',
        priority: 'high',
        reminderMinutesBefore: 30,
        repeat: 'none',
        lastAdaptiveUpdateAt: now,
      })
    );

    updates.push(
      createUserNotification({
        userId: params.crop.userId,
        type: 'adaptive_alert',
        title: `Heat plan updated for ${params.crop.cropType}`,
        body: heatRisk.recommendation,
        priority: 'high',
        actionLabel: 'Open Tasks',
        dedupeKey: `heat-adjustment-${params.crop.id}-${startOfDay().toISOString()}`,
        metadata: {
          cropId: String(params.crop._id),
          adaptationType: 'heatwave_adjustment',
        },
      })
    );
  }

  await Promise.all(updates);
}

async function buildSnapshot(crop: IUserCrop): Promise<CropAssistantSnapshot> {
  const weather = await WeatherService.getWeather(crop.location.latitude, crop.location.longitude);
  const risks = detectWeatherRisks(weather);
  const weatherSummary = buildWeatherSummary(weather, risks);
  const recommendations = risks.length
    ? await AISchedulingService.generateWeatherRecommendations({
        cropType: crop.cropType,
        stage: crop.currentStage,
        weatherSummary,
      })
    : ['Conditions are stable today. Continue the current care routine.'];

  return {
    cropId: String(crop._id),
    cropType: crop.cropType,
    stage: crop.currentStage,
    locationLabel: crop.location.address || 'Farm location',
    weather,
    risks,
    recommendations: [...new Set([...risks.map((risk) => risk.recommendation), ...recommendations])].slice(0, 4),
    analysis: {
      status: risks.length > 0 ? 'Action Required' : 'Healthy',
      summary: `Currently in ${crop.currentStage} stage. ${risks.length > 0 ? 'Weather risks detected.' : 'Conditions are ideal.'}`,
      roadmap: `Focus for next 30 days: Maintain soil moisture and monitor for pests during ${crop.currentStage} transition.`,
    }
  };
}

export class FarmingAdvisorService {
  static async syncUser(userId: string) {
    const crops = await UserCrop.find({ userId, isActive: true, assistantEnabled: true }).sort({ createdAt: -1 });
    const todayTasks = await FarmingTask.find({
      userId,
      scheduledDate: { $gte: startOfDay(), $lte: endOfDay() },
    }).sort({ scheduledDate: 1 });

    const cropSnapshots = await Promise.all(crops.map((crop) => buildSnapshot(crop)));

    await Promise.all(
      crops.map(async (crop) => {
        const risks = cropSnapshots.find((snapshot) => snapshot.cropId === String(crop._id))?.risks || [];
        const pendingWindowTasks = await FarmingTask.find({
          userCropId: crop._id,
          scheduledDate: { $gte: startOfDay(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          status: 'pending',
        });

        await ensureAdaptiveTasks({
          crop,
          tasks: pendingWindowTasks,
          risks,
        });

        await Promise.all(
          risks.map((risk) =>
            createUserNotification({
              userId: crop.userId,
              type: 'weather',
              title: `${risk.title} for ${crop.cropType}`,
              body: risk.recommendation,
              priority: risk.priority,
              actionLabel: 'View Dashboard',
              dedupeKey: `weather-${risk.type}-${crop.id}-${startOfDay().toISOString()}`,
              metadata: {
                cropId: String(crop._id),
                riskType: risk.type,
              },
            })
          )
        );
      })
    );

    const refreshedTasks = await FarmingTask.find({
      userId,
      scheduledDate: { $gte: startOfDay(), $lte: endOfDay() },
    }).sort({ scheduledDate: 1 });

    const recentNotifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();

    return {
      generatedAt: new Date().toISOString(),
      crops,
      todayTasks: refreshedTasks,
      weather: cropSnapshots,
      suggestions: [...new Set(cropSnapshots.flatMap((snapshot) => snapshot.recommendations))].slice(0, 6),
      notifications: recentNotifications,
      summary: {
        cropCount: crops.length,
        todayTaskCount: refreshedTasks.length,
        highPriorityAlerts: cropSnapshots.flatMap((snapshot) => snapshot.risks).filter((risk) => risk.priority === 'high').length,
      },
      previousTodayTasks: todayTasks,
    };
  }
}
