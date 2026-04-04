/**
 * Minimal Design System
 * Clean, agriculture-focused design with subtle colors
 * Inspired by modern agricultural apps - clean, professional, minimal
 */

export const themeMinimal = {
  // Primary Colors - Subtle Green
  colors: {
    // Brand - Subtle Agricultural Green
    primary: '#10b981',      // emerald-500 - main brand color
    primaryLight: '#34d399', // emerald-400 - hover states
    primaryDark: '#059669',  // emerald-600 - pressed states
    primarySubtle: '#d1fae5', // emerald-100 - subtle backgrounds
    
    // Backgrounds - Clean Whites and Grays
    background: '#ffffff',
    backgroundSecondary: '#f9fafb', // gray-50 - subtle contrast
    backgroundTertiary: '#f3f4f6', // gray-100 - cards
    
    // Surface - Cards and elevated content
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    
    // Text - Strong Hierarchy
    text: '#111827',         // gray-900 - primary text
    textSecondary: '#6b7280', // gray-500 - secondary text
    textTertiary: '#9ca3af',  // gray-400 - tertiary text
    textMuted: '#d1d5db',     // gray-300 - muted/disabled
    
    // Semantic Colors - Minimal, functional
    success: '#10b981',       // emerald-500
    successLight: '#d1fae5',  // emerald-100
    warning: '#f59e0b',       // amber-500
    warningLight: '#fef3c7',  // amber-100
    error: '#ef4444',         // red-500
    errorLight: '#fee2e2',    // red-100
    info: '#3b82f6',          // blue-500
    infoLight: '#dbeafe',     // blue-100
    
    // Borders - Subtle separation
    border: '#e5e7eb',        // gray-200
    borderLight: '#f3f4f6',   // gray-100
    borderDark: '#d1d5db',    // gray-300
    
    // Special - Agriculture themed
    soil: '#92400e',          // brown-800 - soil moisture
    sky: '#0ea5e9',           // sky-500 - weather
    sun: '#f59e0b',           // amber-500 - sunshine
    crop: '#10b981',          // emerald-500 - crops/plants
    water: '#06b6d4',         // cyan-500 - irrigation
    
    // Status indicators (subtle)
    urgent: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#6b7280',
  },
  
  // Typography - Clean, readable (matching app's theme)
  typography: {
    // Sizes (matching original theme.ts)
    display: 32,
    title: 24,
    heading: 20,
    subheading: 18,
    body: 15,
    bodySmall: 13,
    label: 13,
    caption: 11,
    
    // Weights
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Line heights
    lineHeights: {
      display: 38,
      title: 30,
      heading: 26,
      subheading: 24,
      body: 22,
      bodySmall: 18,
      label: 18,
      caption: 15,
      // Multipliers
      tight: 1.2,
      normal: 1.5,
    },
  },
  
  // Spacing - 4pt grid system
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    xxxxl: 48,
  },
  
  // Border Radius - Subtle, consistent
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },
  
  // Shadows - Soft, subtle elevation
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  
  // Icon Sizes
  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  
  // Touch Targets
  touchTargets: {
    min: 44,       // iOS HIG minimum
    comfortable: 48,
    large: 56,
  },
  
  // Opacity levels
  opacity: {
    disabled: 0.4,
    muted: 0.6,
    subtle: 0.8,
    full: 1,
  },
};

// Helper to get shadow style
export const getShadow = (level: keyof typeof themeMinimal.shadows) => {
  return themeMinimal.shadows[level];
};

// Common reusable styles
export const commonStyles = {
  card: {
    backgroundColor: themeMinimal.colors.surface,
    borderRadius: themeMinimal.radius.lg,
    padding: themeMinimal.spacing.base,
    ...themeMinimal.shadows.md,
  },
  cardSubtle: {
    backgroundColor: themeMinimal.colors.surface,
    borderRadius: themeMinimal.radius.lg,
    borderWidth: 1,
    borderColor: themeMinimal.colors.border,
    padding: themeMinimal.spacing.base,
  },
  section: {
    marginBottom: themeMinimal.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: themeMinimal.colors.border,
    marginVertical: themeMinimal.spacing.base,
  },
  iconContainer: {
    width: themeMinimal.touchTargets.comfortable,
    height: themeMinimal.touchTargets.comfortable,
    borderRadius: themeMinimal.radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

export type ThemeMinimal = typeof themeMinimal;
