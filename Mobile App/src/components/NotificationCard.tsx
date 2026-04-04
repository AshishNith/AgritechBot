import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CloudRain, Leaf, Sparkles, Package, Info, CalendarClock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeContext';
import { themeMinimal } from '../constants/theme.minimal';
import { AppNotification, NotificationType } from '../types/api';

interface NotificationCardProps {
  notification: AppNotification;
  index: number;
  onPress: (notification: AppNotification) => void;
  onMarkRead: (id: string) => void;
}

const TYPE_ICONS: Record<NotificationType, any> = {
  crop_alert: Leaf,
  weather: CloudRain,
  ai_suggestion: Sparkles,
  order: Package,
  system: Info,
  farming_task: CalendarClock,
  adaptive_alert: Info,
};

const PRIORITY_CONFIG = {
  urgent: {
    color: themeMinimal.colors.error,
    bgColor: themeMinimal.colors.errorLight,
  },
  high: {
    color: themeMinimal.colors.warning,
    bgColor: themeMinimal.colors.warningLight,
  },
  medium: {
    color: themeMinimal.colors.info,
    bgColor: themeMinimal.colors.infoLight,
  },
  low: {
    color: themeMinimal.colors.textTertiary,
    bgColor: themeMinimal.colors.backgroundSecondary,
  },
};

export function NotificationCard({ notification, index, onPress, onMarkRead }: NotificationCardProps) {
  const { colors } = useTheme();
  const Icon = TYPE_ICONS[notification.type];
  const priority = (notification as any).priority || 'low';
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];

  const handlePress = () => {
    if (!notification.read) {
      onMarkRead(notification._id);
    }
    onPress(notification);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          !notification.read && styles.cardUnread,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {/* Icon Badge */}
        <View style={[styles.iconBadge, { backgroundColor: config.bgColor }]}>
          <Icon size={20} color={config.color} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.time}>
              {timeAgo(notification.createdAt)}
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        {/* Unread Indicator */}
        {!notification.read && <View style={styles.unreadDot} />}
      </Pressable>
    </Animated.View>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: themeMinimal.colors.surface,
    borderRadius: themeMinimal.radius.lg,
    padding: themeMinimal.spacing.base,
    marginBottom: themeMinimal.spacing.md,
    gap: themeMinimal.spacing.md,
    borderWidth: 1,
    borderColor: themeMinimal.colors.border,
    ...themeMinimal.shadows.sm,
  },
  cardUnread: {
    backgroundColor: themeMinimal.colors.backgroundSecondary,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: themeMinimal.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: themeMinimal.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: themeMinimal.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: themeMinimal.typography.body,
    fontWeight: themeMinimal.typography.weights.semibold,
    color: themeMinimal.colors.text,
    lineHeight: themeMinimal.typography.body * (themeMinimal.typography.lineHeights as any).tight,
  },
  time: {
    fontSize: themeMinimal.typography.caption,
    fontWeight: (themeMinimal.typography.weights as any).medium,
    color: themeMinimal.colors.textTertiary,
  },
  message: {
    fontSize: (themeMinimal.typography as any).bodySmall,
    color: themeMinimal.colors.textSecondary,
    lineHeight: (themeMinimal.typography as any).bodySmall * (themeMinimal.typography.lineHeights as any).normal,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: themeMinimal.radius.full,
    backgroundColor: themeMinimal.colors.primary,
    position: 'absolute',
    top: themeMinimal.spacing.base,
    right: themeMinimal.spacing.base,
  },
});
