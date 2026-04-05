/**
 * PaywallBottomSheet — shown when the user has 0 credits.
 *
 * Three options per design doc:
 *   1. Subscribe (go to SubscriptionScreen)
 *   2. Topup (go to SubscriptionScreen on topup tab)
 *   3. Share / Referral (earn free credits)
 */

import React, { useCallback } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { useWalletStore } from '../store/useWalletStore';
import { RootStackParamList } from '../navigation/types';

interface PaywallBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  type: 'chat' | 'scan';
}

export function PaywallBottomSheet({ visible, onClose, type }: PaywallBottomSheetProps) {
  const { isDark, colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const wallet = useWalletStore((s) => s.wallet);

  const isChat = type === 'chat';
  const Icon = IconMap[isChat ? 'MessageSquare' : 'Scan'] || View;

  const handleSubscribe = useCallback(() => {
    onClose();
    // Small delay so sheet closes before navigation
    setTimeout(() => navigation.navigate('Subscription', { tab: 'plans' }), 200);
  }, [navigation, onClose]);

  const handleTopup = useCallback(() => {
    onClose();
    setTimeout(() => navigation.navigate('Subscription', { tab: 'topup' }), 200);
  }, [navigation, onClose]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          'Anaaj AI se mere khet ki paidawar badh gayi! 🌾 Tum bhi try karo aur humein referral se free credits milenge. Download karo: https://anaaj.ai/app',
        title: 'Anaaj AI — Smart Farming',
      });
    } catch {
      // ignore
    }
  }, []);

  const planCredits = isChat ? wallet?.chatCredits ?? 0 : wallet?.imageCredits ?? 0;
  const topupCredits = isChat ? wallet?.topupCredits ?? 0 : wallet?.topupImageCredits ?? 0;
  const total = planCredits + topupCredits;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView
              intensity={isDark ? 60 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(250)}
          style={[
            styles.sheet,
            { backgroundColor: isDark ? '#121712' : '#FAFEF6' },
          ]}
        >
          {/* Top handle */}
          <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />

          {/* Icon + heading */}
          <View style={styles.iconRow}>
            <LinearGradient
              colors={['#4CAF5020', '#4CAF5005']}
              style={styles.iconBg}
            >
              <Icon size={32} color={colors.primary} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" style={{ fontSize: 20 }}>
                {isChat ? 'Chat Credits Khatam! 💬' : 'Scan Credits Khatam! 📷'}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                {total === 0
                  ? 'Aapke paas abhi koi credits nahi hain'
                  : `Sirf ${total} credits baaki hain`}
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 3 action tiles */}
          <View style={styles.tilesContainer}>
            {/* Subscribe */}
            <Pressable
              onPress={handleSubscribe}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                  borderColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary + '25', colors.primary + '08']}
                style={styles.tileBg}
              >
                {(() => { const I = IconMap['Crown']; return I ? <I size={24} color={colors.primary} /> : null; })()}
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <AppText variant="label" style={{ fontSize: 15 }}>Subscribe karo</AppText>
                <AppText variant="caption" color={colors.textMuted}>₹149/mo · 50 chats · 3 scans</AppText>
              </View>
              {(() => { const I = IconMap['ChevronRight']; return I ? <I size={18} color={colors.textMuted} /> : null; })()}
            </Pressable>

            {/* Topup */}
            <Pressable
              onPress={handleTopup}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={['#3B82F625', '#3B82F608']}
                style={styles.tileBg}
              >
                {(() => { const I = IconMap['Zap']; return I ? <I size={24} color="#3B82F6" /> : null; })()}
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <AppText variant="label" style={{ fontSize: 15 }}>Topup karo</AppText>
                <AppText variant="caption" color={colors.textMuted}>10 chats sirf ₹49 mein</AppText>
              </View>
              {(() => { const I = IconMap['ChevronRight']; return I ? <I size={18} color={colors.textMuted} /> : null; })()}
            </Pressable>

            {/* Share / Referral */}
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={['#F59E0B25', '#F59E0B08']}
                style={styles.tileBg}
              >
                {(() => { const I = IconMap['Share2']; return I ? <I size={24} color="#F59E0B" /> : null; })()}
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <AppText variant="label" style={{ fontSize: 15 }}>Free mein share karo</AppText>
                <AppText variant="caption" color={colors.textMuted}>Dost ko invite karo · credits pao</AppText>
              </View>
              {(() => { const I = IconMap['ChevronRight']; return I ? <I size={18} color={colors.textMuted} /> : null; })()}
            </Pressable>
          </View>

          {/* Dismiss */}
          <Pressable onPress={onClose} style={styles.dismissBtn}>
            <AppText variant="caption" color={colors.textMuted}>Baad mein</AppText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  tilesContainer: {
    gap: 12,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  tileBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
