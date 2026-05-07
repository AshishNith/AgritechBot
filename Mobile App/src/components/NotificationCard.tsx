import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CloudRain, Leaf, Sparkles, Package, Info, CalendarClock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeContext';
import { AppText } from './ui';
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



export function NotificationCard({ notification, index, onPress, onMarkRead }: NotificationCardProps) {
  const { colors, isDark } = useTheme();
  const Icon = TYPE_ICONS[notification.type];
  
  // Custom priority colors that respect dark mode
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: colors.danger, bg: colors.danger + '15' };
      case 'high': return { color: colors.warning, bg: colors.warning + '15' };
      case 'medium': return { color: colors.info, bg: colors.info + '15' };
      default: return { color: isDark ? colors.textMuted : colors.textMuted, bg: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted };
    }
  };

  const priority = (notification as any).priority || 'low';
  const config = getPriorityStyle(priority);

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
          { 
            backgroundColor: isDark ? colors.surface : colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
            opacity: pressed ? 0.7 : 1,
            // Highlight unread with a subtle left border
            borderLeftWidth: !notification.read ? 4 : 1,
            borderLeftColor: !notification.read ? colors.primary : (isDark ? 'rgba(255,255,255,0.06)' : colors.border),
          },
        ]}
      >
        {/* Icon Badge */}
        <View style={[styles.iconBadge, { backgroundColor: config.bg }]}>
          <Icon size={20} color={config.color} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="label" style={styles.title} numberOfLines={1}>
              {notification.title}
            </AppText>
            <AppText variant="caption" style={styles.time} color={colors.textMuted}>
              {timeAgo(notification.createdAt)}
            </AppText>
          </View>

          {/* Message */}
          <AppText style={styles.message} numberOfLines={2} color={colors.textMuted}>
            {notification.body}
          </AppText>
        </View>

        {/* Unread Indicator */}
        {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
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
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
  },
  time: {
    fontSize: 11,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
