export type Language = 'hi' | 'en' | 'pa' | 'gu';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'gantt' | 'weekly' | 'monthly' | 'list';
export type TaskStatus = 'completed' | 'pending' | 'overdue' | 'ai-suggested';
export type TaskCategory = 'sowing' | 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'soil' | 'other';

export interface CropTask {
  id: string;
  title: string;                   // in selected language
  titleTranslations: Record<Language, string>;
  cropName: string;
  fieldName: string;
  category: TaskCategory;
  status: TaskStatus;
  startDate: string;               // ISO date string YYYY-MM-DD
  endDate: string;
  progress: number;                // 0–100
  isAISuggested: boolean;
  notes?: string;
  aiReason?: string;               // why AI suggested this
}

export interface WeatherDay {
  day: string;
  icon: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  tempHigh: number;
  tempLow: number;
  note: string;
}

export interface AIInsight {
  message: string;
  chips: string[];
  generatedAt: string;
}
