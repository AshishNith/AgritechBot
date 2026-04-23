import React, { useEffect } from 'react';
import { StyleSheet, View, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { AppText, GlassCard, GradientButton } from '../ui';
import { useTheme } from '../../providers/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon = 'alert-circle',
  iconColor,
  actionLabel = 'Understood',
  onAction,
  secondaryLabel,
  onSecondary,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && opacityAnim._value === 0) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
          <Pressable style={styles.backdrop} onPress={onClose}>
            <BlurView intensity={isDark ? 30 : 20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.contentContainer, { transform: [{ translateY: slideAnim }] }]}>
          <GlassCard style={styles.modalCard}>
            <View style={[styles.iconBadge, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
              <Feather name={icon as any} size={32} color={iconColor || colors.primary} />
            </View>

            <AppText variant="title" style={styles.title}>{title}</AppText>
            <AppText color={colors.textMuted} style={styles.message}>{message}</AppText>

            <View style={styles.actions}>
              <GradientButton
                label={actionLabel}
                onPress={() => {
                  if (onAction) onAction();
                  onClose();
                }}
                style={styles.mainAction}
              />
              
              {secondaryLabel && (
                <Pressable 
                  onPress={() => {
                    if (onSecondary) onSecondary();
                    onClose();
                  }}
                  style={styles.secondaryAction}
                >
                  <AppText variant="label" color={colors.textMuted}>{secondaryLabel}</AppText>
                </Pressable>
              )}
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    padding: 30,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 30,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  mainAction: {
    width: '100%',
  },
  secondaryAction: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
