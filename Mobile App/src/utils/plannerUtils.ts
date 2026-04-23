import { CropTask, TaskCategory, TaskStatus } from '../types/planner';
import { FarmingTask } from '../types/api';

export const mapBackendTaskToCropTask = (bt: FarmingTask): CropTask => {
  // Map backend taskType to frontend category
  const categoryMap: Record<string, TaskCategory> = {
    'watering': 'irrigation',
    'fertilizing': 'fertilizer',
    'pesticide': 'pesticide',
    'weeding': 'soil', // or 'other'
    'harvesting': 'harvest',
    'maintenance': 'other',
  };

  // Map backend status to frontend status
  const statusMap: Record<string, TaskStatus> = {
    'pending': 'pending',
    'completed': 'completed',
    'skipped': 'overdue', // or handle skipped differently
    'missed': 'overdue',
  };

  return {
    id: bt._id,
    title: bt.title,
    titleTranslations: {
      en: bt.title,
      hi: bt.title, // In real app, backend should provide translations or we use a translation hook
      pa: bt.title,
      gu: bt.title,
    },
    cropName: bt.cropType || 'Crop', // Backend might need to provide this or we join with crops
    fieldName: bt.location?.address || 'Main Field',
    category: categoryMap[bt.taskType] || 'other',
    status: (bt.source === 'ai' && bt.status === 'pending') ? 'ai-suggested' : (statusMap[bt.status] || 'pending'),
    startDate: bt.scheduledDate,
    endDate: bt.scheduledDate, // Backend only has one date, we can assume same day or +1
    progress: bt.status === 'completed' ? 100 : 0,
    isAISuggested: bt.source === 'ai',
    aiReason: bt.aiReason,
    notes: bt.description,
  };
};
