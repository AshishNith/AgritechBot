import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Svg, Path, Line, Rect, Text as SvgText } from 'react-native-svg';

import { AppText, Pill, Screen, ScreenCard, StatCard } from '../components/ui';
import { useI18n } from '../hooks/useI18n';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { buildWeatherSuggestions } from '../utils/weatherSuggestions';

type Props = NativeStackScreenProps<RootStackParamList, 'WeatherDashboard'>;

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function ForecastLineChart({
  values,
  labels,
  color,
  unit,
  unitLabel,
}: {
  values: number[];
  labels: string[];
  color: string;
  unit: string;
  unitLabel: string;
}) {
  const width = 280;
  const height = 120;
  const path = buildLinePath(values, width, height);

  return (
    <View>
      <Svg width={width} height={height + 26}>
        <Line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <Path d={path} stroke={color} strokeWidth="3" fill="none" />
        {labels.map((label, index) => {
          const x = (index / Math.max(labels.length - 1, 1)) * width;
          return (
            <SvgText
              key={`${label}-${index}`}
              x={x}
              y={height + 18}
              fontSize="10"
              fill="rgba(255,255,255,0.65)"
              textAnchor={index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle'}
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
      <AppText variant="caption" color="rgba(255,255,255,0.72)">
        {unitLabel} {unit}
      </AppText>
    </View>
  );
}

function ForecastBarChart({
  values,
  labels,
  color,
}: {
  values: number[];
  labels: string[];
  color: string;
}) {
  const width = 280;
  const height = 120;
  const max = Math.max(...values, 1);
  const barWidth = width / Math.max(values.length, 1) - 6;

  return (
    <Svg width={width} height={height + 26}>
      {values.map((value, index) => {
        const x = index * (barWidth + 6);
        const barHeight = (value / max) * height;
        return (
          <Rect
            key={`${labels[index]}-${index}`}
            x={x}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx="5"
            fill={color}
            opacity={0.9}
          />
        );
      })}
      {labels.map((label, index) => {
        const x = index * (barWidth + 6) + barWidth / 2;
        return (
          <SvgText
            key={`${label}-label-${index}`}
            x={x}
            y={height + 18}
            fontSize="10"
            fill="rgba(255,255,255,0.65)"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export function WeatherDashboardScreen({ route }: Props) {
  const { colors, isDark } = useTheme();
  const { t, locale } = useI18n();
  const latitude = route.params?.latitude ?? 28.6139;
  const longitude = route.params?.longitude ?? 77.209;
  const locationName = route.params?.locationName ?? t('yourFarm');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['weather-dashboard', latitude, longitude],
    queryFn: async () => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const hourlySlice = useMemo(() => {
    const hours = data?.hourly?.time?.slice(0, 8) ?? [];
    return hours.map((time: string, index: number) => ({
      label: new Date(time).toLocaleTimeString(locale, { hour: 'numeric' }),
      temp: Number(data?.hourly?.temperature_2m?.[index] ?? 0),
      rain: Number(data?.hourly?.precipitation_probability?.[index] ?? 0),
      humidity: Number(data?.hourly?.relative_humidity_2m?.[index] ?? 0),
      wind: Number(data?.hourly?.wind_speed_10m?.[index] ?? 0),
    }));
  }, [data, locale]);

  const dailySlice = useMemo(() => {
    const days = data?.daily?.time ?? [];
    return days.slice(0, 5).map((day: string, index: number) => ({
      label: new Date(day).toLocaleDateString(locale, { weekday: 'short' }),
      maxTemp: Number(data?.daily?.temperature_2m_max?.[index] ?? 0),
      minTemp: Number(data?.daily?.temperature_2m_min?.[index] ?? 0),
      rain: Number(data?.daily?.precipitation_probability_max?.[index] ?? 0),
    }));
  }, [data, locale]);

  const suggestions = useMemo(
    () =>
      buildWeatherSuggestions(
        {
          temperature: data?.current?.temperature_2m,
          humidity: data?.current?.relative_humidity_2m,
          windSpeed: data?.current?.wind_speed_10m,
          rainProbability: hourlySlice[0]?.rain,
          weatherCode: data?.current?.weather_code,
        },
        t
      ),
    [data, hourlySlice, t]
  );

  if (isLoading) {
    return (
      <Screen headerProps={{ title: t('weatherDashboard'), showBack: true }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const tempValues = hourlySlice.map((item: { temp: number }) => item.temp);
  const rainValues = hourlySlice.map((item: { rain: number }) => item.rain);
  const humidityValues = hourlySlice.map((item: { humidity: number }) => item.humidity);
  const hourLabels = hourlySlice.map((item: { label: string }) => item.label);

  return (
    <Screen scrollable headerProps={{ title: t('weatherDashboard'), showBack: true }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <ScreenCard style={[styles.hero, { backgroundColor: isDark ? '#173023' : colors.primaryDark }]}>
          <AppText variant="caption" color="rgba(255,255,255,0.75)">
            {locationName}
          </AppText>
          <AppText variant="display" color="#fff" style={{ marginTop: 8 }}>
            {Math.round(data?.current?.temperature_2m ?? 0)}°C
          </AppText>
          <AppText color="rgba(255,255,255,0.82)">
            {t('liveForecastAutoSuggestions')}
          </AppText>

          <View style={styles.pillRow}>
            <Pill label={`${t('humidity')} ${Math.round(data?.current?.relative_humidity_2m ?? 0)}%`} active />
            <Pill label={`${t('wind')} ${Math.round(data?.current?.wind_speed_10m ?? 0)} km/h`} />
            <Pill label={`${t('rainProbability')} ${Math.round(hourlySlice[0]?.rain ?? 0)}%`} />
          </View>
        </ScreenCard>

        <View style={styles.statsRow}>
          <StatCard label={t('todayMaxLabel')} value={`${Math.round(dailySlice[0]?.maxTemp ?? 0)}°C`} icon="SunMedium" />
          <StatCard label={t('todayMinLabel')} value={`${Math.round(dailySlice[0]?.minTemp ?? 0)}°C`} icon="MoonStar" />
        </View>

        <View style={styles.statsRow}>
          <StatCard label={t('peakRainChance')} value={`${Math.round(Math.max(...rainValues, 0))}%`} icon="CloudRain" />
          <StatCard
            label={t('avgHumidityLabel')}
            value={`${Math.round(humidityValues.reduce((a: number, b: number) => a + b, 0) / Math.max(humidityValues.length, 1))}%`}
            icon="Droplets"
          />
        </View>

        <ScreenCard style={[styles.chartCard, { backgroundColor: '#13271d' }]}>
          <AppText variant="label" color="#fff">{t('temperaturePrediction')}</AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.68)" style={{ marginTop: 4 }}>
            {t('hourByHourTemperatureTrend')}
          </AppText>
          <View style={{ marginTop: 14 }}>
            <ForecastLineChart
              values={tempValues}
              labels={hourLabels}
              color="#8de2b2"
              unit="temperature"
              unitLabel={t('nextHours')}
            />
          </View>
        </ScreenCard>

        <ScreenCard style={[styles.chartCard, { backgroundColor: '#10243a' }]}>
          <AppText variant="label" color="#fff">{t('rainProbability')}</AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.68)" style={{ marginTop: 4 }}>
            {t('nextHourPrecipitationOutlook')}
          </AppText>
          <View style={{ marginTop: 14 }}>
            <ForecastBarChart values={rainValues} labels={hourLabels} color="#6ec5ff" />
          </View>
        </ScreenCard>

        <ScreenCard style={[styles.chartCard, { backgroundColor: '#2c1e0f' }]}>
          <AppText variant="label" color="#fff">{t('humidityTrend')}</AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.68)" style={{ marginTop: 4 }}>
            {t('moistureStressIndicator')}
          </AppText>
          <View style={{ marginTop: 14 }}>
            <ForecastLineChart
              values={humidityValues}
              labels={hourLabels}
              color="#ffb257"
              unit="humidity"
              unitLabel={t('nextHours')}
            />
          </View>
        </ScreenCard>

        <AppText variant="title" style={{ marginTop: 22, marginBottom: 12 }}>{t('autoSuggestionsTitle')}</AppText>
        <View style={{ gap: 10 }}>
          {suggestions.map((suggestion) => (
            <ScreenCard key={suggestion} style={styles.suggestionCard}>
              <AppText variant="label">{suggestion}</AppText>
            </ScreenCard>
          ))}
        </View>

        <AppText variant="title" style={{ marginTop: 22, marginBottom: 12 }}>{t('fiveDayOutlook')}</AppText>
        <View style={{ gap: 10 }}>
          {dailySlice.map((day: { label: string; rain: number; maxTemp: number; minTemp: number }) => (
            <ScreenCard key={day.label} style={styles.dailyCard}>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{day.label}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {t('rainChance')} {Math.round(day.rain)}%
                </AppText>
              </View>
              <AppText variant="label">{Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°</AppText>
            </ScreenCard>
          ))}
        </View>

        <Pressable onPress={() => refetch()} style={[styles.refreshBtn, { backgroundColor: colors.primary }]}>
          <AppText color="#fff" variant="label">{t('refreshForecast')}</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    marginTop: 8,
    padding: 20,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  chartCard: {
    marginTop: 16,
    padding: 18,
  },
  suggestionCard: {
    padding: 16,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshBtn: {
    marginTop: 22,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
