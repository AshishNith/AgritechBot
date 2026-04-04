import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Bell, ShoppingBag, MessageCircle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { themeMinimal } from '../../constants/theme.minimal';
import { EnhancedButton } from './EnhancedButton';

export type EmptyStateType = 'tasks' | 'notifications' | 'products' | 'chats';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG = {
  tasks: {
    icon: CheckCircle2,
    title: 'All Caught Up!',
    message: "No pending tasks for today.\nEnjoy your day!",
    actionLabel: 'Add New Task',
  },
  notifications: {
    icon: Bell,
    title: 'No Notifications',
    message: "We'll notify you when something\nimportant happens.",
    actionLabel: null,
  },
  products: {
    icon: ShoppingBag,
    title: 'No Products Found',
    message: 'Try adjusting your filters\nor search terms.',
    actionLabel: 'Clear Filters',
  },
  chats: {
    icon: MessageCircle,
    title: 'Start a Conversation',
    message: 'Ask me anything about farming,\ncrops, or weather!',
    actionLabel: 'Start Chatting',
  },
};

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={40} color={themeMinimal.colors.textTertiary} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>

      {config.actionLabel && onAction && (
        <EnhancedButton label={config.actionLabel} onPress={onAction} variant="primary" />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeMinimal.spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: themeMinimal.radius.full,
    backgroundColor: themeMinimal.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: themeMinimal.spacing.xl,
  },
  title: {
    fontSize: themeMinimal.typography.title,
    fontWeight: themeMinimal.typography.weights.bold,
    color: themeMinimal.colors.text,
    marginBottom: themeMinimal.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: themeMinimal.typography.body,
    lineHeight: themeMinimal.typography.body * (themeMinimal.typography.lineHeights as any).normal,
    color: themeMinimal.colors.textSecondary,
    textAlign: 'center',
    marginBottom: themeMinimal.spacing.xl,
  },
});
