import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Sprout, Calendar, ArrowRight, Sparkles, Layout } from 'lucide-react-native';
import { AppText, GlassCard, AnimatedIcon } from '../ui';
import { useTheme } from '../../providers/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../hooks/useI18n';
import { getPlannerTheme } from '../../constants/plannerTheme';

interface PlannerWidgetProps {
  onPress: () => void;
  plans?: any[];
}

export const PlannerWidget: React.FC<PlannerWidgetProps> = ({ onPress, plans = [] }) => {
  const { isDark } = useTheme();
  const { language: appLang } = useAppStore();
  const { t: tx } = useI18n();
  const theme = getPlannerTheme(isDark ? 'dark' : 'light');

  const totalPlans = plans.length;
  const latestPlan = plans[0];
  const currentCrop = latestPlan?.crop || tx('noCropsWidget');

  // Logic for progress if stages are available
  const stages = latestPlan?.generatedPlan?.stages || [];
  const progressPercent = totalPlans > 0 ? 100 : 0; // Simplified for widget

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accent + '15' }]}>
              <AnimatedIcon name="Calendar" size={18} color={theme.accent} animation="float" />
            </View>
            <AppText variant="label" weight="bold" style={{ fontSize: 17 }}>{tx('plannerTitle')}</AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.accent + '10' }]}>
            <AnimatedIcon name="Sparkles" size={12} color={theme.accent} animation="rotate" duration={4000} />
            <AppText style={{ color: theme.accent, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginLeft: 4 }}>{tx('aiBadge')}</AppText>
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.infoCol}>
            <AppText variant="caption" color={theme.text2} style={styles.infoLabel}>{tx('cropLabel').toUpperCase()}</AppText>
            <View style={styles.cropValRow}>
              <Sprout size={14} color={theme.accent} style={{ marginRight: 6 }} />
              <AppText weight="bold" style={{ fontSize: 16 }}>{currentCrop}</AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoCol}>
            <AppText variant="caption" color={theme.text2} style={styles.infoLabel}>{tx('roadmapLabel').toUpperCase()}</AppText>
            <AppText weight="bold" style={{ fontSize: 18, color: theme.accent }}>{totalPlans}</AppText>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <AppText variant="caption" weight="bold" color={theme.text}>
              {stages.length > 0 ? `${stages.length} ${tx('suggestedStages')}` : tx('readyToGenerate')}
            </AppText>
            <AppText variant="caption" color={theme.accent}>{progressPercent}% {tx('completed').toUpperCase()}</AppText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: theme.accent }]} />
          </View>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color={theme.text2} style={{ fontSize: 11 }}>
            {tx('plannerSubtitle')}
          </AppText>
          <View style={styles.actionBtn}>
            <AppText variant="caption" weight="bold" color={theme.accent}>{tx('manage').toUpperCase()}</AppText>
            <ArrowRight size={14} color={theme.accent} style={{ marginLeft: 4 }} />
          </View>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cropValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
