import type { ChatToolDefinition } from './weather.tool';

export const mandiPriceTool: ChatToolDefinition = {
  name: 'get_mandi_price',
  description:
    "Get current wholesale market (mandi) prices for a crop in the farmer's region.",
  parameters: {
    type: 'object',
    properties: {
      crop: { type: 'string', description: 'Crop name' },
      state: { type: 'string', description: 'Indian state' },
    },
    required: ['crop', 'state'],
  },
  async execute(input) {
    return {
      crop: String(input.crop || ''),
      state: String(input.state || ''),
      source: 'stub',
      status: 'coming_soon',
      message:
        'Live mandi price integration is scaffolded but not active yet. Connect AGMARKNET or another verified pricing source before depending on this data.',
    };
  },
};
