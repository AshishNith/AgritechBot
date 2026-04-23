import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MapPin, Droplets, Wind, Gauge, Lightbulb, Sun, Cloud, CloudRain, CloudLightning, CloudSun } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeContext';
import { themeMinimal } from '../constants/theme.minimal';
import { AppText, GlassCard, AnimatedIcon } from './ui';

interface HeroWeatherCardProps {
  temperature: number;
  condition: string;
  locationName: string;
  humidity: number;
  windSpeed: number;
  soilMoisture: number;
  advice?: string;
  weatherCode: number;
  onPress?: () => void;
}

function StatPill({ icon: Icon, value, label, colors, isDark }: { icon: any; value: string; label: string; colors: any; isDark: boolean }) {
  return (
    <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
      <Icon size={14} color={colors.primary} strokeWidth={2.5} />
      <View style={{ marginLeft: 6 }}>
        <AppText weight="bold" style={{ fontSize: 13, lineHeight: 16 }}>{value}</AppText>
        <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</AppText>
      </View>
    </View>
  );
}

export function HeroWeatherCard({
  temperature,
  condition,
  locationName,
  humidity,
  windSpeed,
  soilMoisture,
  advice,
  weatherCode,
  onPress,
}: HeroWeatherCardProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('WeatherDashboard' as never);
    }
  };

  // Weather-specific logic for icons and colors
  const getWeatherConfig = () => {
    if (weatherCode >= 95) return { icon: CloudLightning, accent: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }; // Stormy
    if (weatherCode >= 51) return { icon: CloudRain, accent: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }; // Rainy
    if (weatherCode >= 3) return { icon: Cloud, accent: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' }; // Cloudy
    if (weatherCode >= 1) return { icon: CloudSun, accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // Partly Cloudy
    return { icon: Sun, accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // Clear
  };

  const weatherConfig = getWeatherConfig();
  const weatherIconName = weatherCode >= 95 ? 'CloudLightning' :
    weatherCode >= 51 ? 'CloudRain' :
      weatherCode >= 3 ? 'Cloud' :
        weatherCode >= 1 ? 'CloudSun' : 'Sun';

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <GlassCard padded={false} style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={styles.contentLayout}>
            {/* Left side: Main Weather info */}
            <View style={styles.mainInfo}>
              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.primary} strokeWidth={2.5} />
                <AppText variant="caption" color={colors.textMuted} style={styles.locationText}>
                  {locationName}
                </AppText>
              </View>

              <View style={styles.heroRow}>
                <AppText weight="bold" style={[styles.temperature, { color: isDark ? '#ffffff' : '#1a1a1a' }]}>
                  {Math.round(temperature)}°
                </AppText>
                <View style={styles.conditionCol}>
                  <AppText weight="bold" style={styles.condition}>{condition}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>FORECAST</AppText>
                </View>
              </View>
            </View>

            {/* Right side: Visual Accent */}
            <View style={[styles.accentCircle, { backgroundColor: weatherConfig.bg }]}>
              <View style={[styles.accentCore, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <AnimatedIcon
                  name={weatherIconName}
                  size={32}
                  color={weatherConfig.accent}
                  animation="float"
                  duration={2500}
                />
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatPill icon={Droplets} value={`${humidity}%`} label="Humid" colors={colors} isDark={isDark} />
            <StatPill icon={Wind} value={`${Math.round(windSpeed)}`} label="km/h" colors={colors} isDark={isDark} />
            <StatPill icon={Gauge} value={`${soilMoisture}%`} label="Soil" colors={colors} isDark={isDark} />
          </View>

          {/* Advisory */}
          {advice && (
            <View style={[styles.adviceBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.primary + '08', borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.primary + '15' }]}>
              <View style={[styles.adviceIcon, { backgroundColor: colors.warning + '15' }]}>
                <Lightbulb size={12} color={colors.warning} strokeWidth={2.5} />
              </View>
              <AppText color={isDark ? colors.textOnDark : colors.text} style={styles.adviceText} numberOfLines={1}>
                {advice}
              </AppText>
            </View>
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginHorizontal: 0,
  },
  card: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  contentLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  mainInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '700',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  temperature: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
  },
  conditionCol: {
    justifyContent: 'center',
  },
  condition: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  accentCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accentCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
  },
  adviceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
});
