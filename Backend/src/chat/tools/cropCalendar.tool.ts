import knowledgeBase from '../data/knowledgeBase.json';
import type { ChatToolDefinition } from './weather.tool';

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export const cropCalendarTool: ChatToolDefinition = {
  name: 'get_crop_calendar',
  description:
    'Get the optimal planting and harvesting schedule for a specific crop in a specific region.',
  parameters: {
    type: 'object',
    properties: {
      crop: { type: 'string', description: 'Crop name' },
      state: { type: 'string', description: 'Indian state' },
      month: { type: 'number', description: 'Current month number from 1 to 12' },
    },
    required: ['crop', 'state'],
  },
  async execute(input) {
    const crop = normalize(String(input.crop || ''));
    const month = Number(input.month || new Date().getMonth() + 1);
    const state = String(input.state || 'Unknown state');

    const seasonEntry = Object.entries(knowledgeBase.seasons).find(([, season]) =>
      season.crops.some((seasonCrop) => normalize(seasonCrop) === crop)
    );

    if (!seasonEntry) {
      return {
        crop,
        state,
        month,
        source: 'knowledgeBase',
        note: 'No curated crop calendar found yet for this crop and region.',
      };
    }

    const [seasonName, season] = seasonEntry;
    const sowingWindow = season.months.slice(0, Math.min(2, season.months.length));
    const harvestWindow = season.months.slice(-2);

    return {
      crop,
      state,
      month,
      source: 'knowledgeBase',
      season: seasonName,
      sowingWindow,
      harvestWindow,
      advisory:
        `Use this as a baseline for ${state}. Exact sowing and harvest timing should be adjusted for rainfall pattern, irrigation access, and local advisory.`,
    };
  },
};
