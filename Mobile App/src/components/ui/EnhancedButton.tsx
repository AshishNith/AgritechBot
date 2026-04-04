import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeContext';
import { themeMinimal } from '../../constants/theme.minimal';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface EnhancedButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const SIZE_STYLES = {
  sm: { height: themeMinimal.touchTargets.min, paddingHorizontal: themeMinimal.spacing.base, fontSize: themeMinimal.typography.caption },
  md: { height: themeMinimal.touchTargets.comfortable, paddingHorizontal: themeMinimal.spacing.lg, fontSize: themeMinimal.typography.body },
  lg: { height: themeMinimal.touchTargets.large, paddingHorizontal: themeMinimal.spacing.xl, fontSize: (themeMinimal.typography as any).subheading },
};

const BUTTON_GRADIENTS: Record<string, string[]> = {
  primary: [themeMinimal.colors.primary, themeMinimal.colors.primaryLight],
  danger: [themeMinimal.colors.error, '#f87171'], // red-400
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EnhancedButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: EnhancedButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyle = SIZE_STYLES[size];
  const isGradient = variant === 'primary' || variant === 'danger';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (isGradient) return '#ffffff';
    if (isOutline) return colors.primary;
    if (isGhost) return colors.primary;
    return colors.primaryDark;
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, { fontSize: sizeStyle.fontSize, color: getTextColor() }]}>
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        animatedStyle,
        { width: fullWidth ? '100%' : 'auto' },
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={BUTTON_GRADIENTS[variant] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            { height: sizeStyle.height, paddingHorizontal: sizeStyle.paddingHorizontal },
          ]}
        >
          {content}
        </LinearGradient>
      ) : (
        <Animated.View
          style={[
            styles.button,
            { height: sizeStyle.height, paddingHorizontal: sizeStyle.paddingHorizontal },
            isOutline && {
              borderWidth: 2,
              borderColor: colors.border,
              backgroundColor: 'transparent',
            },
            isGhost && {
              backgroundColor: 'transparent',
            },
            variant === 'secondary' && {
              backgroundColor: isDark ? 'rgba(82,183,129,0.15)' : 'rgba(82,183,129,0.1)',
            },
          ]}
        >
          {content}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: themeMinimal.radius.md,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: themeMinimal.spacing.sm,
    borderRadius: themeMinimal.radius.md,
  },
  buttonPrimary: {
    backgroundColor: themeMinimal.colors.primary,
    ...themeMinimal.shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: themeMinimal.colors.primarySubtle,
    borderWidth: 1,
    borderColor: themeMinimal.colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeMinimal.colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: themeMinimal.colors.error,
    ...themeMinimal.shadows.sm,
  },
  label: {
    fontWeight: themeMinimal.typography.weights.semibold,
    textAlign: 'center',
  },
});
