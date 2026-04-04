/**
 * WalletCreditBadge — compact pill showing remaining credits.
 * Tap → navigate to SubscriptionScreen.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { useWalletStore } from '../store/useWalletStore';
import { RootStackParamList } from '../navigation/types';

interface WalletCreditBadgeProps {
  /** Which credit type to show. Defaults to 'chat'. */
  type?: 'chat' | 'scan';
  style?: any;
}

export function WalletCreditBadge({ type = 'chat', style }: WalletCreditBadgeProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const totalChatCredits = useWalletStore((s) => s.totalChatCredits);
  const totalScanCredits = useWalletStore((s) => s.totalScanCredits);

  const count = type === 'chat' ? totalChatCredits() : totalScanCredits();
  const isLow = count <= 3;
  const isEmpty = count === 0;

  const badgeColor = isEmpty
    ? '#EF4444'
    : isLow
    ? '#F59E0B'
    : colors.primary;

  const ZapIcon = IconMap['Zap'];
  const ScanIcon = IconMap['Scan'];
  const TheIcon = type === 'chat' ? ZapIcon : ScanIcon;

  return (
    <Animated.View entering={FadeIn}>
      <Pressable
        onPress={() => navigation.navigate('Subscription')}
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor + '18',
            borderColor: badgeColor + '40',
          },
          style,
        ]}
      >
        {TheIcon && <TheIcon size={13} color={badgeColor} />}
        <AppText style={[styles.label, { color: badgeColor }]}>
          {count} {type === 'chat' ? 'chats' : 'scans'}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
