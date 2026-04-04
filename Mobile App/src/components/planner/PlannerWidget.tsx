import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassCard } from '../ui';
import { useTheme } from '../../providers/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../hooks/useI18n';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';
import { Language } from '../../types/planner';

interface PlannerWidgetProps {
  onPress: () => void;
  tasksCount?: number;
}

export const PlannerWidget: React.FC<PlannerWidgetProps> = ({ onPress, tasksCount = 12 }) => {
  const { isDark } = useTheme();
  const { language: appLang } = useAppStore();
  const langMap: Record<string, Language> = {
    'English': 'en',
    'Hindi': 'hi',
    'Punjabi': 'pa',
    'Gujarati': 'gu'
  };
  const lang = (langMap[appLang] || 'en') as Language;
  const theme = getPlannerTheme(isDark ? 'dark' : 'light');
  const t = (key: string) => translations[lang][key] || key;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accent + '20' }]}>
              <Feather name="calendar" size={18} color={theme.accent} />
            </View>
            <AppText variant="label" style={{ fontSize: 16 }}>{t('plannerTitle')}</AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.purpleLight }]}>
            <AppText style={{ color: theme.purple, fontSize: 10, fontWeight: '700' }}>AI Powered</AppText>
          </View>
        </View>

        <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.stat}>
            <AppText weight="bold" style={{ fontSize: 24, color: theme.accent }}>{tasksCount}</AppText>
            <AppText variant="caption" color={theme.text2}>{t('totalTasks')}</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <AppText weight="bold" style={{ fontSize: 24, color: theme.amber }}>3</AppText>
            <AppText variant="caption" color={theme.text2}>{t('pending')}</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <View style={styles.aiGlow}>
              <MaterialCommunityIcons name="robot" size={24} color={theme.purple} />
            </View>
            <AppText variant="caption" color={theme.text2}>{t('aiInsights')}</AppText>
          </View>
        </View>

        <View style={styles.timelinePreview}>
          <View style={[styles.timelineBar, { backgroundColor: theme.surface2 }]}>
            <View style={[styles.progress, { width: '65%', backgroundColor: theme.accent }]} />
          </View>
          <View style={styles.timelineLabels}>
            <AppText variant="caption" style={{ fontSize: 10, color: theme.text }}>Wheat Sowing</AppText>
            <AppText variant="caption" style={{ fontSize: 10, color: theme.text2 }}>65% Complete</AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color={theme.accent} style={{ fontWeight: '700' }}>
            {t('viewAllTasks')} →
          </AppText>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  aiGlow: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  timelinePreview: {
    marginBottom: 12,
  },
  timelineBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progress: {
    height: '100%',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: 'flex-end',
  },
});
