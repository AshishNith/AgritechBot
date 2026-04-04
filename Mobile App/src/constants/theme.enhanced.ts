import { Dimensions, Platform, TextStyle, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

// Extended color palette
const lightColors = {
  // Existing
  primary: '#52b781',
  primaryDark: '#1f7b54',
  accent: '#c8f169',
  background: '#f6f7f7',
  backgroundAlt: '#eef2ef',
  surface: '#ffffff',
  surfaceMuted: '#f0f5f1',
  text: '#102117',
  textMuted: '#6b7a71',
  textOnDark: '#f7faf8',
  border: '#d8e2db',
  success: '#52b781',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#2563eb',
  shadow: '#0d170f',
  overlay: 'rgba(16, 33, 23, 0.55)',
  glass: 'rgba(255,255,255,0.14)',

  // NEW: Extended semantic colors
  successLight: '#d4f4e2',
  successDark: '#1f7b54',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',
  infoLight: '#dbeafe',
  infoDark: '#1d4ed8',

  // NEW: Agricultural accents
  soil: '#8b7355',
  sky: '#60a5fa',
  sun: '#fbbf24',
  crop: '#84cc16',

  // NEW: Gray scale
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

const darkColors = {
  primary: '#52b781',
  primaryDark: '#75cf9e',
  accent: '#c8f169',
  background: '#0b120e',
  backgroundAlt: '#151d19',
  surface: '#1d2a24',
  surfaceMuted: '#121a16',
  text: '#f7faf8',
  textMuted: '#9aa8a0',
  textOnDark: '#f7faf8',
  border: '#2a3a31',
  success: '#52b781',
  warning: '#fbb32b',
  danger: '#ff5f5f',
  info: '#3b82f6',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
  glass: 'rgba(255,255,255,0.08)',

  // NEW: Extended dark mode
  successLight: 'rgba(82, 183, 129, 0.2)',
  successDark: '#75cf9e',
  warningLight: 'rgba(251, 179, 43, 0.2)',
  warningDark: '#fbb32b',
  dangerLight: 'rgba(255, 95, 95, 0.2)',
  dangerDark: '#ff5f5f',
  infoLight: 'rgba(59, 130, 246, 0.2)',
  infoDark: '#3b82f6',

  soil: '#a78a6f',
  sky: '#60a5fa',
  sun: '#fcd34d',
  crop: '#a3e635',

  gray50: '#1a1a1a',
  gray100: '#262626',
  gray200: '#333333',
  gray300: '#404040',
  gray400: '#525252',
  gray500: '#737373',
  gray600: '#a3a3a3',
  gray700: '#d4d4d4',
  gray800: '#e5e5e5',
  gray900: '#f5f5f5',
};

// Gradient presets
export const gradients = {
  primary: ['#52b781', '#75d39f'] as const,
  sunset: ['#f59e0b', '#ef4444'] as const,
  sky: ['#2563eb', '#60a5fa'] as const,
  earth: ['#8b7355', '#a78a6f'] as const,
  success: ['#52b781', '#84cc16'] as const,
  premium: ['#8b5cf6', '#ec4899'] as const,
  danger: ['#ef4444', '#dc2626'] as const,
  warning: ['#f59e0b', '#ea580c'] as const,
};

export const themeEnhanced = {
  colors: lightColors,
  darkColors: darkColors,
  lightColors: lightColors,
  gradients,

  typography: {
    display: {
      fontSize: 36,
      lineHeight: 42,
      fontWeight: '800' as TextStyle['fontWeight'],
      letterSpacing: -0.5,
    },
    displaySmall: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    heading: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    subheading: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as TextStyle['fontWeight'],
    },
    bodyLarge: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '400' as TextStyle['fontWeight'],
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0.3,
    },
    overline: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: 1.2,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
    xxxxxl: 48,
  },

  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    round: 999,
  },

  shadow: {
    subtle: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    } satisfies ViewStyle,
    sm: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    } satisfies ViewStyle,
    medium: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    } satisfies ViewStyle,
    card: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.09,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    } satisfies ViewStyle,
    high: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.15,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    } satisfies ViewStyle,
    glow: {
      shadowColor: '#52b781',
      shadowOpacity: Platform.OS === 'ios' ? 0.35 : 0.2,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 8 },
      elevation: 12,
    } satisfies ViewStyle,
  },

  touchTarget: {
    min: 44,
    comfortable: 48,
    large: 56,
  },

  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    hero: 64,
  },

  layout: {
    screenWidth: width,
    screenHeight: height,
    contentWidth: Math.min(width - 32, 430),
    tabBarHeight: 86,
  },
};

export type AppThemeEnhanced = typeof themeEnhanced;
export type ThemeColorsEnhanced = typeof lightColors;
