import React from 'react';
import { Modal, StyleSheet, View, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { AppText, GradientButton } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';

interface UsageLimitModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'chat' | 'scan';
  limit: number;
}

export function UsageLimitModal({ visible, onClose, type, limit }: UsageLimitModalProps) {
  const { isDark, colors } = useTheme();
  const navigation = useNavigation<any>();

  const isChat = type === 'chat';
  const Icon = IconMap[isChat ? 'MessageSquare' : 'Scan'] || View;
  
  const handleUpgrade = () => {
    onClose();
    navigation.navigate('Subscription');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={isDark ? 50 : 30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        </Pressable>

        <Animated.View 
          entering={FadeInDown.springify()}
          style={[
            styles.content, 
            { 
              backgroundColor: isDark ? '#1a1f1c' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
             <Icon size={40} color={colors.primary} />
             <View style={styles.alertBadge}>
                {(() => {
                  const AlertIcon = IconMap['AlertCircle'];
                  return AlertIcon ? <AlertIcon size={16} color="#ffffff" /> : null;
                })()}
             </View>
          </View>

          <AppText variant="heading" style={styles.title}>
            Limit Reached!
          </AppText>
          
          <AppText style={[styles.description, { color: colors.textMuted }]}>
            You've used all your {limit} {isChat ? 'chats' : 'scans'} for this month. 
            Upgrade to a premium plan to continue using {isChat ? 'Krishi Assistant' : 'AI Crop Doctor'}.
          </AppText>

          <View style={styles.buttonContainer}>
            <GradientButton 
              label="Check Plans" 
              onPress={handleUpgrade}
              style={styles.button}
            />
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AppText variant="label" color={colors.textMuted}>
                Maybe Later
              </AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
