import type { AppTranslationKey } from '../hooks/useI18n';

type TranslateWeatherText = (key: AppTranslationKey) => string;

export function buildWeatherSuggestions(
  params: {
    temperature?: number | null;
    humidity?: number | null;
    windSpeed?: number | null;
    rainProbability?: number | null;
    soilMoisture?: number | null;
    weatherCode?: number | null;
  },
  translate: TranslateWeatherText
): string[] {
  const suggestions: string[] = [];
  const temp = params.temperature ?? null;
  const humidity = params.humidity ?? null;
  const wind = params.windSpeed ?? null;
  const rainProbability = params.rainProbability ?? null;
  const soilMoisture = params.soilMoisture ?? null;
  const weatherCode = params.weatherCode ?? null;
  const raining = weatherCode != null && weatherCode >= 61;

  if (raining || (rainProbability ?? 0) >= 60) {
    suggestions.push(translate('suggestRainSkipWatering'));
  }

  if (temp != null && temp >= 36) {
    suggestions.push(translate('suggestHeatIncreaseWatering'));
  }

  if (temp != null && temp <= 6) {
    suggestions.push(translate('suggestColdProtectPlants'));
  }

  if (wind != null && wind >= 20) {
    suggestions.push(translate('suggestWindAvoidSpraying'));
  }

  if (soilMoisture != null && soilMoisture < 30) {
    suggestions.push(translate('suggestSoilDryIrrigation'));
  }

  if (humidity != null && humidity > 85) {
    suggestions.push(translate('suggestHighHumidityMonitorFungus'));
  }

  if (suggestions.length === 0) {
    suggestions.push(translate('suggestStableWeather'));
    suggestions.push(translate('suggestCoolHours'));
    suggestions.push(translate('suggestMonitor12Hours'));
  }

  return suggestions.slice(0, 3);
}

export function localizeWeatherCondition(
  condition: string | null | undefined,
  translate: TranslateWeatherText
) {
  const normalized = condition?.trim().toLowerCase() ?? '';

  if (!normalized) return '';
  if (normalized.includes('storm') || normalized.includes('thunder')) return translate('weatherStormy');
  if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower')) return translate('weatherRainy');
  if (normalized.includes('partly')) return translate('weatherPartlyCloudy');
  if (normalized.includes('cloud')) return translate('weatherCloudy');
  if (normalized.includes('fog') || normalized.includes('mist') || normalized.includes('haze')) return translate('weatherFoggy');
  if (normalized.includes('clear') || normalized.includes('sun')) return translate('weatherClear');

  return condition ?? '';
}
