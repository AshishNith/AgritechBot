import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MessageSquare, Calendar, Mic, Camera, LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeContext';
import { AppText, GlassCard } from './ui';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  route: string;
  color: string;
}

export function QuickActionGrid() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();

  const actions: QuickAction[] = [
    { icon: MessageSquare, label: 'AI Chat', route: 'Chat', color: colors.primary },
    { icon: Calendar, label: 'Smart Planner', route: 'Planner', color: '#8b5cf6' }, // purple
    { icon: Mic, label: 'Voice', route: 'Voice', color: colors.warning },
    { icon: Camera, label: 'Scan Crop', route: 'ImageScan', color: '#10b981' }, // green/crop
  ];

  const handleActionPress = (route: string) => {
    navigation.navigate(route as never);
  };

  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.label}
          entering={FadeInDown.delay(200 + index * 50).springify()}
          style={styles.actionWrapper}
        >
          <Pressable
            onPress={() => handleActionPress(action.route)}
            style={({ pressed }) => [
              styles.actionCard,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <GlassCard style={[styles.innerCard, { borderColor: colors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                <action.icon size={24} color={action.color} strokeWidth={2} />
              </View>
              <AppText weight="bold" style={styles.actionLabel}>{action.label}</AppText>
            </GlassCard>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionWrapper: {
    width: '48%',
  },
  actionCard: {
    width: '100%',
  },
  innerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
});
