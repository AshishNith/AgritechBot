import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, AppText, GlassCard, Pill } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { apiService } from '../api/services';

export const CropPlanResult: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t: tx } = useI18n();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { planId } = route.params;

  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>('Land Preparation');

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await apiService.getCropPlanById(planId);
      if (response.success) {
        setPlanData(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={{ marginTop: 16 }}>{tx('loadingPlan')}</AppText>
      </Screen>
    );
  }

  const plan = planData.generatedPlan;

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <AppText variant="title">{plan.crop} {tx('cropRoadmap')}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{plan.total_duration}</AppText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <AppText variant="caption" color={colors.textMuted}>{tx('totalCost')}</AppText>
            <AppText weight="bold" style={{ color: colors.primary }}>{plan.total_estimated_cost}</AppText>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <AppText variant="caption" color={colors.textMuted}>{tx('expYield')}</AppText>
            <AppText weight="bold" style={{ color: '#2563eb' }}>{plan.expected_yield}</AppText>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <AppText variant="caption" color={colors.textMuted}>{tx('profitEst')}</AppText>
            <AppText weight="bold" style={{ color: '#059669' }}>{plan.profit_estimation}</AppText>
          </GlassCard>
        </View>

        {/* Risk Alerts */}
        {plan.risk_alerts?.length > 0 && (
          <GlassCard style={[styles.riskCard, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
            <View style={styles.riskHeader}>
              <Feather name="alert-triangle" size={18} color="#ef4444" />
              <AppText weight="bold" style={{ color: '#991b1b', marginLeft: 8 }}>{tx('criticalRiskAlerts')}</AppText>
            </View>
            {plan.risk_alerts.map((risk: string, i: number) => (
              <AppText key={i} variant="caption" style={{ color: '#b91c1c', marginTop: 4 }}>• {risk}</AppText>
            ))}
          </GlassCard>
        )}

        {/* Timeline */}
        <View style={styles.timeline}>
          {plan.stages.map((stage: any, index: number) => {
            const isExpanded = expandedStage === stage.stage_name;
            return (
              <View key={index} style={styles.stageContainer}>
                <View style={styles.timelineLine}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  {index !== plan.stages.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setExpandedStage(isExpanded ? null : stage.stage_name)}
                  style={{ flex: 1 }}
                >
                  <GlassCard style={[styles.stageCard, isExpanded && { borderColor: colors.primary }]}>
                    <View style={styles.stageHeader}>
                      <View style={{ flex: 1 }}>
                        <AppText weight="bold" style={{ fontSize: 16 }}>{stage.stage_name}</AppText>
                        <AppText variant="caption" color={colors.textMuted}>{stage.duration}</AppText>
                      </View>
                      <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
                    </View>

                    {isExpanded && (
                      <View style={styles.stageDetails}>
                        {stage.tasks.map((task: any, tIdx: number) => (
                          <View key={tIdx} style={styles.taskItem}>
                            <View style={styles.taskHeader}>
                              <Feather name="check-circle" size={16} color={colors.primary} />
                              <AppText weight="bold" style={{ marginLeft: 8, fontSize: 14 }}>{task.task}</AppText>
                            </View>
                            <AppText style={styles.taskDetails}>{task.details}</AppText>

                            <View style={styles.taskFooter}>
                              <View style={styles.tagWrap}>
                                {task.tools_required.map((tool: string, i: number) => (
                                  <Pill key={i} label={tool} style={{ backgroundColor: colors.surface }} />
                                ))}
                              </View>
                              <AppText variant="caption" color={colors.primary} weight="bold">{task.estimated_cost}</AppText>
                            </View>

                            <View style={styles.tipBox}>
                              <AppText variant="caption" weight="bold" style={{ color: colors.primary }}>Expert Tip:</AppText>
                              <AppText variant="caption" color={colors.textMuted}>{task.tips}</AppText>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Alternatives */}
        <View style={styles.alternatives}>
          <AppText weight="bold" style={{ marginBottom: 12 }}>{tx('alternativeStrategies')}</AppText>
          <View style={{ gap: 12 }}>
            <GlassCard style={styles.altCard}>
              <View style={styles.altHeader}>
                <Feather name="trending-down" size={16} color={colors.textMuted} />
                <AppText weight="bold" style={{ marginLeft: 8, fontSize: 13 }}>{tx('lowBudgetApproach')}</AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted}>{plan.alternative_suggestions?.low_budget}</AppText>
            </GlassCard>
            <GlassCard style={styles.altCard}>
              <View style={styles.altHeader}>
                <Feather name="trending-up" size={16} color={colors.primary} />
                <AppText weight="bold" style={{ marginLeft: 8, fontSize: 13, color: colors.primary }}>{tx('highBudgetApproach')}</AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted}>{plan.alternative_suggestions?.high_budget}</AppText>
            </GlassCard>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  riskCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeline: {
    marginBottom: 24,
  },
  stageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLine: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 20,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -10,
    marginBottom: -10,
  },
  stageCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDetails: {
    marginTop: 16,
    gap: 16,
  },
  taskItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4b5563',
    marginTop: 6,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    gap: 4,
  },
  tipBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  alternatives: {
    marginTop: 8,
  },
  altCard: {
    padding: 12,
    borderRadius: 16,
  },
  altHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});
