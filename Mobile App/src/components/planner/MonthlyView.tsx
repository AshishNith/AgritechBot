import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassCard } from '../ui';
import { CropTask, Language, ThemeMode, WeatherDay } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';
import { useAppStore } from '../../store/useAppStore';

interface MonthlyViewProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ tasks, lang, themeMode }) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const location = useAppStore((state) => state.user?.location);
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setWeather([]);
      return;
    }
    let cancelled = false;
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        );
        const json = await response.json();
        const daily = json?.daily;
        if (!daily?.time) throw new Error('No forecast data');
        const forecast: WeatherDay[] = daily.time.map((date: string, i: number) => {
          const code: number = daily.weather_code[i];
          const icon: WeatherDay['icon'] =
            code === 0 ? 'sunny' : code <= 3 ? 'partly-cloudy' : code >= 51 && code !== 45 && code !== 48 ? 'rainy' : 'cloudy';
          return {
            day: format(new Date(date + 'T00:00:00'), 'EEE'),
            icon,
            tempHigh: Math.round(daily.temperature_2m_max[i]),
            tempLow: Math.round(daily.temperature_2m_min[i]),
            note: '',
          };
        });
        if (!cancelled) setWeather(forecast);
      } catch {
        if (!cancelled) setWeather([]);
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    };
    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(day, new Date(task.startDate)));
  };

  return (
    <View style={styles.container}>
      {/* Weather Strip */}
      {weather.length > 0 && <GlassCard style={[styles.weatherStrip, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
        <View style={styles.weatherHeader}>
          <Feather name="cloud-rain" size={16} color={theme.blue} />
          <AppText weight="bold" style={{ fontSize: 12, color: theme.blue }}>5-DAY FORECAST</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weatherList}>
          {weather.map((w, i) => (
            <View key={i} style={styles.weatherDay}>
              <AppText weight="bold" style={{ fontSize: 11, color: theme.text2 }}>{w.day}</AppText>
              <MaterialCommunityIcons 
                name={w.icon === 'sunny' ? 'weather-sunny' : w.icon === 'rainy' ? 'weather-rainy' : 'weather-cloudy'} 
                size={20} 
                color={theme.amber} 
              />
              <AppText weight="bold" style={{ fontSize: 12 }}>{w.tempHigh}°</AppText>
            </View>
          ))}
        </ScrollView>
      </GlassCard>}

      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText weight="bold" style={{ fontSize: 18 }}>{format(currentMonth, 'MMMM yyyy')}</AppText>
        <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Feather name="chevron-right" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={styles.dayHeaderCell}>
            <AppText style={{ fontSize: 12, color: theme.text3 }}>{d}</AppText>
          </View>
        ))}
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          return (
            <TouchableOpacity key={i} style={[styles.cell, { borderTopColor: theme.border, borderRightColor: theme.border }]}>
              <AppText style={[styles.dateNum, { color: isSameDay(day, new Date()) ? theme.accent : theme.text }]}>
                {format(day, 'd')}
              </AppText>
              <View style={styles.dotsContainer}>
                {dayTasks.map(t => (
                  <View key={t.id} style={[styles.dot, { backgroundColor: theme.accent }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weatherStrip: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weatherList: {
    gap: 20,
    paddingRight: 10,
  },
  weatherDay: {
    alignItems: 'center',
    gap: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 8,
  },
  dayHeaderCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cell: {
    width: '14.28%',
    height: 60,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateNum: {
    fontSize: 13,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
