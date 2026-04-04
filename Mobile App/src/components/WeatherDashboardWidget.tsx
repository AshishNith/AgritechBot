import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, GlassCard } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';

interface WeatherDashboardWidgetProps {
  temp: string;
  condition: string;
  location: string;
  humidity: string;
  wind: string;
  soilMoisture?: string;
  isRaining?: boolean;
  suggestions?: string[];
  onPress?: () => void;
}

export function WeatherDashboardWidget({
  temp,
  condition,
  location,
  humidity,
  wind,
  soilMoisture,
  isRaining,
  suggestions,
  onPress,
}: WeatherDashboardWidgetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  const getAdvice = () => {
    const moist = soilMoisture ? parseInt(soilMoisture) : 40;
    if (isRaining) return t('weatherRainyAdvice');
    if (moist < 30) return t('weatherDry');
    if (moist > 70) return t('weatherSaturated');
    return t('weatherOptimal');
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <GlassCard style={styles.container}>
      <View style={styles.mainRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <AppText variant="caption" color={colors.textMuted} style={{ marginLeft: 4 }}>
              {location}
            </AppText>
          </View>
          <AppText variant="display" style={styles.tempText}>{temp}</AppText>
          <AppText variant="label" color={colors.primary}>{condition}</AppText>
        </View>
        
        <View style={styles.iconContainer}>
          {(() => {
            const Icon = isRaining ? IconMap['CloudRain'] : IconMap['CloudSun'];
            return Icon ? <Icon size={64} color={colors.primary} /> : null;
          })()}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          {(() => { const Icon = IconMap['Droplets']; return Icon ? <Icon size={16} color={colors.primary} /> : null; })()}
          <View style={{ marginLeft: 8 }}>
            <AppText variant="caption" color={colors.textMuted}>{t('humidity')}</AppText>
            <AppText variant="label" style={{ fontSize: 13 }}>{humidity}</AppText>
          </View>
        </View>

        <View style={styles.statBox}>
          {(() => { const Icon = IconMap['Wind']; return Icon ? <Icon size={16} color={colors.primary} /> : null; })()}
          <View style={{ marginLeft: 8 }}>
            <AppText variant="caption" color={colors.textMuted}>{t('wind')}</AppText>
            <AppText variant="label" style={{ fontSize: 13 }}>{wind}</AppText>
          </View>
        </View>

        {soilMoisture && (
          <View style={styles.statBox}>
            {(() => { const Icon = IconMap['Sprout']; return Icon ? <Icon size={16} color={colors.primary} /> : null; })()}
            <View style={{ marginLeft: 8 }}>
              <AppText variant="caption" color={colors.textMuted}>{t('soil')}</AppText>
              <AppText variant="label" style={{ fontSize: 13 }}>{soilMoisture}</AppText>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.adviceBox, { backgroundColor: colors.primary + '10' }]}>
        <View style={styles.adviceHeader}>
          {(() => { const Icon = IconMap['Sparkles']; return Icon ? <Icon size={14} color={colors.primary} /> : null; })()}
          <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('smartAdvisory')}
          </AppText>
          {onPress ? (
            <AppText variant="caption" color={colors.primary} style={{ marginLeft: 'auto', fontWeight: '700' }}>
              {t('viewDashboard')}
            </AppText>
          ) : null}
        </View>
        <AppText variant="caption" style={{ marginTop: 4, lineHeight: 18 }}>
          {getAdvice()}
        </AppText>
        {suggestions?.length ? (
          <View style={styles.suggestionList}>
            {suggestions.map((suggestion) => (
              <View key={suggestion} style={styles.suggestionRow}>
                <View style={[styles.suggestionDot, { backgroundColor: colors.primary }]} />
                <AppText variant="caption" style={{ flex: 1, lineHeight: 18 }}>
                  {suggestion}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    borderRadius: 28,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tempText: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adviceBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionList: {
    marginTop: 10,
    gap: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
});
