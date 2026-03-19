import { Dimensions, Platform, TextStyle, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#52b781',
    primaryDark: '#1f7b54',
    accent: '#c8f169',
    background: '#f6f7f7',
    backgroundAlt: '#eef2ef',
    backgroundDark: '#151d19',
    backgroundDarkest: '#0b120e',
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
  },
  typography: {
    display: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '700' as TextStyle['fontWeight'],
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
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as TextStyle['fontWeight'],
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    caption: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 0.8,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    round: 999,
  },
  shadow: {
    card: {
      shadowColor: '#0d170f',
      shadowOpacity: 0.09,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    } satisfies ViewStyle,
    glow: {
      shadowColor: '#52b781',
      shadowOpacity: Platform.OS === 'ios' ? 0.35 : 0.2,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 8 },
      elevation: 12,
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
