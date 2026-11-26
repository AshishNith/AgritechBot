import { logger } from '../../utils/logger';

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

// Open-Meteo: free, no API key (the mobile app's home screen uses the same source).
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8_000;

// WMO weather codes → plain words.
const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

async function getJson(url: string, params: Record<string, string>): Promise<any> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  return response.json();
}

/** Finds coordinates for an Indian district (falls back to the state). */
async function geocode(district: string, state: string): Promise<{ lat: number; lon: number; name: string } | null> {
  for (const name of [district, state].filter(Boolean)) {
    const data = await getJson(GEOCODE_URL, { name, count: '10', language: 'en', format: 'json' });
    const results: any[] = Array.isArray(data?.results) ? data.results : [];
    const inIndia = results.filter((r) => r.country_code === 'IN');
    const match =
      inIndia.find((r) => state && String(r.admin1 || '').toLowerCase().includes(state.toLowerCase())) ||
      inIndia[0];
    if (match) {
      return { lat: match.latitude, lon: match.longitude, name: [match.name, match.admin1].filter(Boolean).join(', ') };
    }
  }
  return null;
}

export const weatherTool: ChatToolDefinition = {
  name: 'get_weather',
  description:
    "Get current weather and the 5-day forecast for the farmer's district. Use when the farmer asks about weather, rain, temperature, or when to irrigate or spray.",
  parameters: {
    type: 'object',
    properties: {
      district: { type: 'string', description: "Farmer's district" },
      state: { type: 'string', description: "Farmer's state" },
    },
    required: ['district', 'state'],
  },
  async execute(input) {
    const district = String(input.district || '').trim();
    const state = String(input.state || '').trim();

    try {
      const place = await geocode(district, state);
      if (!place) {
        return { district, state, error: 'Location not found. Ask the farmer for a nearby town name.' };
      }

      const data = await getJson(FORECAST_URL, {
        latitude: String(place.lat),
        longitude: String(place.lon),
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        timezone: 'Asia/Kolkata',
        forecast_days: '5',
      });

      const daily = data?.daily ?? {};
      const forecast = (daily.time ?? []).map((date: string, i: number) => ({
        date,
        condition: WEATHER_CODES[daily.weather_code?.[i]] ?? 'Unknown',
        maxTempC: daily.temperature_2m_max?.[i],
        minTempC: daily.temperature_2m_min?.[i],
        rainMm: daily.precipitation_sum?.[i],
        rainChancePercent: daily.precipitation_probability_max?.[i],
      }));

      return {
        location: place.name,
        source: 'Open-Meteo live forecast',
        current: {
          condition: WEATHER_CODES[data?.current?.weather_code] ?? 'Unknown',
          temperatureC: data?.current?.temperature_2m,
          humidityPercent: data?.current?.relative_humidity_2m,
          windSpeedKmph: data?.current?.wind_speed_10m,
          rainNowMm: data?.current?.precipitation,
        },
        forecast,
      };
    } catch (error) {
      logger.warn({ err: error, district, state }, 'Weather tool failed');
      return {
        district,
        state,
        error: 'Live weather is unavailable right now. Do not guess the weather; suggest the IMD Meghdoot app.',
      };
    }
  },
};
