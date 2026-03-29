export interface ChatToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export const weatherTool: ChatToolDefinition = {
  name: 'get_weather',
  description:
    "Get current weather and 5-day forecast for the farmer's district. Use when farmer asks about weather, rain, temperature, or when to irrigate.",
  parameters: {
    type: 'object',
    properties: {
      district: { type: 'string', description: "Farmer's district" },
      state: { type: 'string', description: "Farmer's state" },
    },
    required: ['district', 'state'],
  },
  async execute(input) {
    const district = String(input.district || 'Unknown district');
    const state = String(input.state || 'Unknown state');

    return {
      district,
      state,
      source: 'stub',
      current: {
        condition: 'Partly cloudy',
        temperatureC: 31,
        humidityPercent: 58,
        windSpeedKmph: 12,
      },
      forecast: [
        { day: 'Day 1', condition: 'Light clouds', maxTempC: 32, minTempC: 22, rainChancePercent: 20 },
        { day: 'Day 2', condition: 'Humid', maxTempC: 33, minTempC: 23, rainChancePercent: 35 },
        { day: 'Day 3', condition: 'Light rain', maxTempC: 30, minTempC: 22, rainChancePercent: 65 },
        { day: 'Day 4', condition: 'Cloudy', maxTempC: 29, minTempC: 21, rainChancePercent: 40 },
        { day: 'Day 5', condition: 'Sunny intervals', maxTempC: 31, minTempC: 22, rainChancePercent: 15 },
      ],
      advisory:
        'This is placeholder weather data. Activate a real weather provider before relying on irrigation timing in production.',
    };
  },
};
