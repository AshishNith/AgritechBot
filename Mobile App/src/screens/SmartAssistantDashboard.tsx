import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { AppText, GradientButton, Pill, Screen, ScreenCard } from '../components/ui';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { RootStackParamList } from '../navigation/types';
import { buildWeatherSuggestions, localizeWeatherCondition } from '../utils/weatherSuggestions';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartAssistant'>;
type TranslateFn = (key: any) => string;

export function SmartAssistantDashboard({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();

  const { data: crops, isLoading: cropsLoading, refetch: refetchCrops } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });

  const { data: allTasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getTasks(),
  });

  const todayTasks = useMemo(() => {
    if (!allTasks) return [];
    const today = new Date().toISOString().split('T')[0];
    return allTasks.filter((task: any) => task.scheduledDate.startsWith(today) && task.status === 'pending');
  }, [allTasks]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => apiService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const onRefresh = () => {
    refetchCrops();
    refetchTasks();
  };

  if (cropsLoading || tasksLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Screen headerProps={{ title: t('smartAssistantTitle'), showBack: true }}>
      <FlatList
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        data={crops}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => (
          <>
            {crops && crops.length > 0 ? (
              <WeatherSection
                crop={crops[0]}
                translate={t}
                onPress={() =>
                  navigation.navigate('WeatherDashboard', {
                    latitude: crops[0].location?.latitude,
                    longitude: crops[0].location?.longitude,
                    locationName: crops[0].location?.address || t('yourFarm'),
                  })
                }
              />
            ) : null}

            <AppText variant="title" style={{ marginTop: 24, marginBottom: 12 }}>
              {t('tasksForToday')}
            </AppText>

            {todayTasks.length === 0 ? (
              <ScreenCard style={styles.emptyTasks}>
                <Ionicons name="checkmark-circle" size={40} color={theme.colors.primary} />
                <AppText style={{ marginTop: 8 }}>{t('allCaughtUpNoTasks')}</AppText>
              </ScreenCard>
            ) : (
              todayTasks.map((task: any) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  translate={t}
                  onComplete={() => updateTaskMutation.mutate({ id: task._id, status: 'completed' })}
                  onSkip={() => updateTaskMutation.mutate({ id: task._id, status: 'skipped' })}
                />
              ))
            )}

            <AppText variant="title" style={{ marginTop: 24, marginBottom: 12 }}>
              {t('myCrops')}
            </AppText>

            {crops?.length === 0 ? (
              <ScreenCard style={styles.emptyCrops}>
                <AppText variant="label">{t('noCropsRegistered')}</AppText>
                <AppText color={theme.colors.textMuted}>{t('registerCropForSchedules')}</AppText>
              </ScreenCard>
            ) : null}
          </>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('CropPlanResult', { planId: item._id })}
            style={styles.cropItem}
          >
            <View style={styles.cropIcon}>
              <Ionicons name="leaf" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="label">{item.cropType}</AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {item.currentStage} • {t('plantedLabel')} {new Date(item.plantingDate).toLocaleDateString(locale)}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
          </Pressable>
        )}
        ListFooterComponent={() => (
          <View style={{ marginTop: 24, paddingBottom: 40 }}>
            <GradientButton
              label={t('registerNewCrop')}
              onPress={() => navigation.navigate('CropPlannerForm')}
              leftIcon={<Ionicons name="add" size={20} color="#fff" />}
            />
          </View>
        )}
      />
    </Screen>
  );
}

function WeatherSection({
  crop,
  onPress,
  translate,
}: {
  crop: any;
  onPress: () => void;
  translate: TranslateFn;
}) {
  const { data: weather } = useQuery({
    queryKey: ['weather', crop._id],
    queryFn: () => apiService.getCropWeather(crop._id),
  });

  if (!weather) return null;

  const suggestions = buildWeatherSuggestions(
    {
      temperature: weather.temp,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      rainProbability: weather.forecast?.next24hRainMm ? Math.min(100, weather.forecast.next24hRainMm * 5) : undefined,
    },
    translate
  );

  const localizedCondition = localizeWeatherCondition(weather.condition, translate);
  const locationSuffix = crop.location?.address ? ` ${translate('inYourArea')} ${crop.location.address}` : '';

  return (
    <Pressable onPress={onPress}>
      <ScreenCard style={styles.weatherCard}>
        <View style={styles.weatherRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="title" color="#fff">{weather.temp.toFixed(0)}°C</AppText>
            <AppText color="#fff" style={{ opacity: 0.8 }}>
              {`${localizedCondition}${locationSuffix}`.trim()}
            </AppText>
          </View>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
            style={{ width: 60, height: 60 }}
          />
        </View>

        {weather.alerts && weather.alerts.length > 0 ? (
          <View style={styles.alertBox}>
            <Ionicons name="warning" size={18} color="#FFD700" />
            <AppText color="#fff" style={{ fontSize: 13, marginLeft: 8, fontWeight: '600', flex: 1 }}>
              {weather.alerts[0].event}: {weather.alerts[0].description}
            </AppText>
          </View>
        ) : null}

        <View style={styles.suggestionWrap}>
          {suggestions.map((suggestion) => (
            <Pill key={suggestion} label={suggestion} style={styles.suggestionPill} />
          ))}
        </View>
      </ScreenCard>
    </Pressable>
  );
}

function TaskItem({
  task,
  onComplete,
  onSkip,
  translate,
}: {
  task: any;
  onComplete: () => void;
  onSkip: () => void;
  translate: TranslateFn;
}) {
  const iconMap: any = {
    watering: 'water',
    fertilizing: 'flask',
    pesticide: 'bug',
    weeding: 'cut',
    harvesting: 'basket',
    maintenance: 'construct',
  };

  return (
    <ScreenCard style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <View style={[styles.taskIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name={iconMap[task.taskType] || 'list'} size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText variant="label">{task.title}</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>{task.description}</AppText>
        </View>
      </View>
      <View style={styles.taskActions}>
        <Pressable onPress={onSkip} style={styles.skipBtn}>
          <AppText variant="caption" color={theme.colors.textMuted}>{translate('skip')}</AppText>
        </Pressable>
        <Pressable onPress={onComplete} style={styles.completeBtn}>
          <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 4 }} />
          <AppText variant="caption" color="#fff" style={{ fontWeight: '700' }}>{translate('done')}</AppText>
        </Pressable>
      </View>
    </ScreenCard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20 },
  weatherCard: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 24,
    padding: 20,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  suggestionPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  emptyTasks: {
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCrops: {
    padding: 24,
    alignItems: 'center',
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cropIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskItem: {
    marginBottom: 12,
    padding: 14,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
});
