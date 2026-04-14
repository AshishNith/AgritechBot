import { Dimensions, Platform, TextStyle, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

const lightColors = {
  primary: '#52b781',
  primaryDark: '#1f7b54',
  accent: '#c8f169',
  background: '#f8faf9',
  backgroundAlt: '#edf5ef',
  surface: '#ffffff',
  surfaceMuted: '#f3f7f4',
  text: '#1a2e1f',
  textMuted: '#5a6b5e',
  textOnDark: '#f7faf8',
  border: '#dce6dd',
  success: '#52b781',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#2563eb',
  shadow: '#0d170f',
  overlay: 'rgba(16, 33, 23, 0.55)',
  glass: 'rgba(255,255,255,0.14)',
};

const darkColors = {
  primary: '#6dcf96',
  primaryDark: '#8de2b2',
  accent: '#c8f169',
  background: '#0a110d',
  backgroundAlt: '#121a15',
  surface: '#1a2520',
  surfaceMuted: '#151d19',
  text: '#e8f0eb',
  textMuted: '#8a9a90',
  textOnDark: '#f7faf8',
  border: '#2a3a30',
  success: '#6dcf96',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
  glass: 'rgba(255,255,255,0.06)',
};

export const theme = {
  colors: lightColors, // Default
  darkColors: darkColors,
  lightColors: lightColors,
  typography: {
    display: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.3,
    },
    heading: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 0.2,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
    round: 999,
  },
  shadow: {
    xs: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.03,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    } satisfies ViewStyle,
    sm: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    } satisfies ViewStyle,
    card: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    } satisfies ViewStyle,
    glow: {
      shadowColor: '#52b781',
      shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    } satisfies ViewStyle,
  },
  layout: {
    screenWidth: width,
    screenHeight: height,
    contentWidth: Math.min(width - 32, 430),
    tabBarHeight: 86,
  },
};

export type AppTheme = typeof theme;
export type ThemeColors = typeof lightColors;
