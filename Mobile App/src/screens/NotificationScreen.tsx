import { IconMap } from '../components/IconMap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { AppNotification, NotificationType } from '../types/api';
import { useTheme } from '../providers/ThemeContext';
import { NotificationCard } from '../components/NotificationCard';
import { EmptyState } from '../components/ui/EmptyState';

const TABS: { labelKey: string; type?: NotificationType }[] = [
  { labelKey: 'all' },
  { labelKey: 'cropsGrown', type: 'crop_alert' },
  { labelKey: 'weather', type: 'weather' },
  { labelKey: 'aiCropAssistant', type: 'ai_suggestion' },
];

const TYPE_ICONS: Record<NotificationType, any> = {
  crop_alert: 'Leaf',
  weather: 'CloudRain',
  ai_suggestion: 'Sparkles',
  order: 'Package',
  system: 'Info',
  farming_task: 'CalendarClock',
  adaptive_alert: 'RefreshCcw',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationScreen() {
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();
  const { t: tx } = useI18n();
  const activeType = TABS[activeTab].type;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', activeType],
    queryFn: () => apiService.getNotifications(activeType),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (data?.unreadCount != null) {
      setUnreadCount(data.unreadCount);
    }
  }, [data?.unreadCount, setUnreadCount]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'crop_alert': return isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.14)';
      case 'weather': return isDark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.12)';
      case 'ai_suggestion': return isDark ? 'rgba(82,183,129,0.2)' : 'rgba(82,183,129,0.14)';
      case 'order': return isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.14)';
      default: return isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)';
    }
  };

  return (
    <Screen scrollable refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
    }>
      <View style={styles.header}>
        <AppText variant="heading">{tx('notifications')}</AppText>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllReadMutation.mutate()}>
            <AppText color={colors.primary} variant="label">
              {markAllReadMutation.isPending ? tx('saving') : tx('markAllRead')}
            </AppText>
          </Pressable>
        )}
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab, index) => (
          <Pressable
            key={tab.labelKey}
            onPress={() => setActiveTab(index)}
            style={[styles.tab, { backgroundColor: isDark ? colors.surface : colors.backgroundAlt }, index === activeTab && [styles.tabActive, { backgroundColor: colors.primary }]]}
          >
            <AppText
              variant="label"
              color={index === activeTab ? colors.textOnDark : colors.textMuted}
            >
              {tx(tab.labelKey as any)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText color={colors.textMuted} style={{ marginTop: 12 }}>
            {tx('loadingNotifications')}
          </AppText>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          {(() => { const IconComp = IconMap['AlertCircle']; return IconComp ? <IconComp size={48} color={colors.danger} /> : null; })()}
          <AppText color={colors.textMuted} style={{ marginTop: 12 }}>
            {tx('failedToLoadNotifications')}
          </AppText>
          <GradientButton label={tx('retry')} onPress={() => refetch()} secondary style={{ marginTop: 16 }} />
        </View>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState type="notifications" />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <View style={{ gap: 0 }}>
          {notifications.map((item: AppNotification, index) => (
            <NotificationCard
              key={item._id}
              notification={item}
              index={index}
              onPress={() => {}}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </View>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <ScreenCard style={[styles.suggestionCard, { backgroundColor: colors.primaryDark }]}>
          <AppText variant="label" color={colors.textOnDark}>
            {tx('stayUpdated')}
          </AppText>
          <AppText color="#ddf4e8" style={{ marginTop: 8 }}>
            {tx('stayUpdatedSubtitle')}
          </AppText>
        </ScreenCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 18,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    // Background set dynamically
  },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCardUnread: {
    borderLeftWidth: 3,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  suggestionCard: {
    marginTop: 18,
    paddingBottom: 120,
  },
});
