import { queryLLM } from './ai/llmRouter';
import { IUserCrop } from '../models/UserCrop';
import { TaskType, TaskStatus } from '../models/FarmingTask';
import { logger } from '../utils/logger';

export interface GeneratedTask {
  taskType: TaskType;
  title: string;
  description: string;
  daysAfterPlanting: number;
  priority: 'low' | 'medium' | 'high';
  reminderMinutesBefore?: number;
  repeat?: 'none' | 'daily' | 'weekly';
}

export class AISchedulingService {
  /**
   * Generates a 60-day farming schedule for a specific crop and stage
   */
  static async generateSchedule(crop: IUserCrop): Promise<GeneratedTask[]> {
    const prompt = `
      You are an expert Agronomist. Generate a comprehensive 60-day farming schedule for the following crop:
      - Crop: ${crop.cropType}
      - Variety: ${crop.variety || 'Standard'}
      - Soil Type: ${crop.soilType || 'Loamy'}
      - Current Stage: ${crop.currentStage}
      - Planting Date: ${crop.plantingDate.toISOString()}
      - Location: ${crop.location.address || 'India'}

      Return a JSON array of tasks covering the next 2 months. Each task must have:
      - taskType: One of ['watering', 'fertilizing', 'pesticide', 'weeding', 'harvesting', 'maintenance']
      - title: Short descriptive title
      - description: Detailed agronomic instructions and "Why" this is needed (Analysis)
      - daysAfterPlanting: Number of days from today to schedule this (0 to 60)
      - priority: One of ['low', 'medium', 'high']
      - reminderMinutesBefore: Number between 15 and 180
      - repeat: One of ['none', 'daily', 'weekly']

      Important: Generate at least 15-20 tasks to provide a full monthly roadmap. 
      Include critical growth stages like tillering, flowering, or grain filling depending on the crop.

      Only return the JSON array. No other text.
    `;

    try {
      const response = await queryLLM([{ role: 'user', content: prompt }]);
      const cleanedContent = response.content.replace(/```json|```/g, '').trim();
      const tasks: GeneratedTask[] = JSON.parse(cleanedContent);
      return tasks;
    } catch (error: any) {
      logger.error({ error: error.message, cropId: crop._id }, 'AI Schedule generation failed');
      // Fallback: Return a basic watering task
      return [
        {
          taskType: 'watering',
          title: 'Scheduled Watering',
          description: 'Regular watering based on general crop needs.',
          daysAfterPlanting: 1,
          priority: 'medium',
          reminderMinutesBefore: 30,
          repeat: 'none',
        },
      ];
    }
  }

  /**
   * Generates an "AI Reason" for a specific task adjustment (e.g. skip due to rain)
   */
  static async getAdjustmentReason(taskTitle: string, weatherCondition: string): Promise<string> {
    const prompt = `
      Briefly explain why a "${taskTitle}" task should be skipped or modified given the weather is "${weatherCondition}".
      Keep it under 20 words.
    `;

    try {
      const response = await queryLLM([{ role: 'user', content: prompt }]);
      return response.content.trim();
    } catch {
      return `Adjustment made due to ${weatherCondition}.`;
    }
  }

  static async generateWeatherRecommendations(params: {
    cropType: string;
    stage: string;
    weatherSummary: string;
  }): Promise<string[]> {
    const prompt = `
      You are an agronomy assistant. Suggest exactly 3 short actionable recommendations for:
      Crop: ${params.cropType}
      Stage: ${params.stage}
      Weather: ${params.weatherSummary}

      Return a JSON array of short strings, each under 14 words.
    `;

    try {
      const response = await queryLLM([{ role: 'user', content: prompt }]);
      const cleaned = response.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string').slice(0, 3);
      }
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Weather recommendation generation failed, using fallback');
    }

    return [
      'Check field moisture before the next irrigation cycle.',
      'Inspect crop stress signs during the cooler part of the day.',
      'Adjust today’s field work based on rain and temperature risk.',
    ];
  }
}
