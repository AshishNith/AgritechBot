import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  alerts: WeatherAlert[];
  rain1hMm?: number;
  forecast?: {
    next24hRainMm: number;
    maxTempNext24h: number;
    minTempNext24h: number;
  };
}

export interface WeatherAlert {
  event: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
}

export class WeatherService {
  private static apiKey = env.OPENWEATHER_API_KEY;
  private static baseUrl = 'https://api.openweathermap.org/data/2.5';

  /**
   * Get current weather and alerts for a location
   */
  static async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    if (!this.apiKey) {
      logger.warn('OpenWeather API key not found. Skipping weather fetch.');
      return null;
    }

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/weather`, {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units: 'metric',
          },
        }),
        axios.get(`${this.baseUrl}/forecast`, {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units: 'metric',
          },
        }),
      ]);

      const data = currentResponse.data;
      const forecast = forecastResponse.data;
      
      const alerts: WeatherAlert[] = [];
      const next24h = Array.isArray(forecast?.list) ? forecast.list.slice(0, 8) : [];
      const next24hRainMm = next24h.reduce(
        (sum: number, item: any) => sum + Number(item?.rain?.['3h'] || 0),
        0
      );
      const maxTempNext24h = next24h.reduce(
        (max: number, item: any) => Math.max(max, Number(item?.main?.temp_max ?? item?.main?.temp ?? Number.NEGATIVE_INFINITY)),
        Number.NEGATIVE_INFINITY
      );
      const minTempNext24h = next24h.reduce(
        (min: number, item: any) => Math.min(min, Number(item?.main?.temp_min ?? item?.main?.temp ?? Number.POSITIVE_INFINITY)),
        Number.POSITIVE_INFINITY
      );

      if (data.weather[0].main === 'Rain' && (data.rain?.['1h'] > 5 || next24hRainMm >= 12)) {
        alerts.push({
          event: 'Heavy Rain',
          description: 'Intense rainfall detected. Ensure proper drainage for crops.',
          severity: 'severe',
        });
      }
      if (data.weather[0].main === 'Thunderstorm' || data.wind?.speed >= 14) {
        alerts.push({
          event: 'Storm',
          description: 'Strong wind or thunderstorm conditions detected.',
          severity: 'severe',
        });
      }
      if (data.main.temp >= 38 || maxTempNext24h >= 40) {
        alerts.push({
          event: 'Extreme Heat',
          description: 'High heat stress likely. Increase crop moisture monitoring.',
          severity: 'severe',
        });
      }
      if (data.main.temp <= 4 || minTempNext24h <= 3) {
        alerts.push({
          event: 'Frost',
          description: 'Low temperatures may damage sensitive plants overnight.',
          severity: 'severe',
        });
      }

      return {
        temp: data.main.temp,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        alerts: alerts,
        rain1hMm: Number(data.rain?.['1h'] || 0),
        forecast: {
          next24hRainMm,
          maxTempNext24h: Number.isFinite(maxTempNext24h) ? maxTempNext24h : data.main.temp,
          minTempNext24h: Number.isFinite(minTempNext24h) ? minTempNext24h : data.main.temp,
        },
      };
    } catch (error: any) {
      logger.error({ error: error.message, lat, lon }, 'Failed to fetch weather data');
      return null;
    }
  }

  /**
   * Get 5-day forecast to check for upcoming rain/extreme events
   */
  static async getForecast(lat: number, lon: number) {
    if (!this.apiKey) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, lat, lon }, 'Failed to fetch forecast data');
      return null;
    }
  }

  /**
   * Check if rain is predicted in the next 24 hours
   */
  static async willRainSoon(lat: number, lon: number): Promise<boolean> {
    const forecast = await this.getForecast(lat, lon);
    if (!forecast || !forecast.list) return false;

    // Check first 8 entries (approx 24 hours of 3-hour steps)
    const next24h = forecast.list.slice(0, 8);
    return next24h.some((item: any) => 
      item.weather[0].main === 'Rain' || 
      (item.pop && item.pop > 0.6) // Probability of precipitation > 60%
    );
  }
}
