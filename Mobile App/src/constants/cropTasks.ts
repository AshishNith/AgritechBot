import { CropTask } from '../types/planner';

export const sampleTasks: CropTask[] = [
  {
    id: '1',
    title: 'Sowing Wheat',
    titleTranslations: {
      en: 'Sowing Wheat',
      hi: 'गेहूं की बुवाई',
      pa: 'ਕਣਕ ਦੀ ਬਿਜਾਈ',
      gu: 'ઘઉંની વાવણી',
    },
    cropName: 'Wheat',
    fieldName: 'Main Field',
    category: 'sowing',
    status: 'completed',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    progress: 100,
    isAISuggested: false,
  },
  {
    id: '2',
    title: 'Irrigation cycle 1',
    titleTranslations: {
      en: 'Irrigation cycle 1',
      hi: 'सिंचाई चक्र 1',
      pa: 'ਸਿੰਚਾਈ ਚੱਕਰ 1',
      gu: 'સિંચાઈ ચક્ર 1',
    },
    cropName: 'Wheat',
    fieldName: 'Main Field',
    category: 'irrigation',
    status: 'pending',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    progress: 0,
    isAISuggested: true,
    aiReason: 'High temperature predicted next week.',
  },
  {
    id: '3',
    title: 'NPK Fertilizer',
    titleTranslations: {
      en: 'NPK Fertilizer',
      hi: 'NPK उर्वरक',
      pa: 'NPK ਖਾਦ',
      gu: 'NPK ખાતર',
    },
    cropName: 'Wheat',
    fieldName: 'Main Field',
    category: 'fertilizer',
    status: 'overdue',
    startDate: '2026-04-03',
    endDate: '2026-04-04',
    progress: 20,
    isAISuggested: false,
  }
];
