import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, AppText, Pill } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { apiService } from '../api/services';
import { theme } from '../constants/theme';

export const CropPlanResult: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t: tx } = useI18n();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { planId } = route.params;

  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>('Land Preparation');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  // Load completed tasks checklist from local device storage
  useEffect(() => {
    if (planId) {
      AsyncStorage.getItem(`@crop_plan_checklist_${planId}`)
        .then((saved) => {
          if (saved) {
            setCompletedTasks(JSON.parse(saved));
          }
        })
        .catch((err) => console.warn('Failed to load crop plan progress:', err));
    }
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

  // Toggle completion status for a specific task
  const toggleTaskCompletion = async (stageIdx: number, taskIdx: number) => {
    const key = `${stageIdx}-${taskIdx}`;
    const updated = {
      ...completedTasks,
      [key]: !completedTasks[key],
    };
    setCompletedTasks(updated);
    try {
      await AsyncStorage.setItem(`@crop_plan_checklist_${planId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save crop plan progress:', err);
    }
  };

  const plan = planData?.generatedPlan;

  // Calculate dynamic roadmap completion progress
  const calculateProgress = () => {
    if (!plan || !plan.stages) return 0;
    let total = 0;
    let completed = 0;
    plan.stages.forEach((stage: any, sIdx: number) => {
      stage.tasks?.forEach((task: any, tIdx: number) => {
        total++;
        if (completedTasks[`${sIdx}-${tIdx}`]) {
          completed++;
        }
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const progressPercent = calculateProgress();

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={{ marginTop: 16 }}>{tx('loadingPlan') || 'Loading plan...'}</AppText>
      </Screen>
    );
  }

  if (!planData || !planData.generatedPlan) {
    return (
      <Screen style={styles.center}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <AppText style={{ marginTop: 16 }}>Failed to load plan.</AppText>
        <TouchableOpacity style={{ marginTop: 24, padding: 12 }} onPress={() => navigation.goBack()}>
          <AppText color={colors.primary} weight="bold">Go Back</AppText>
        </TouchableOpacity>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={isDark ? colors.textOnDark : colors.text} />
        </TouchableOpacity>
        <View>
          <AppText variant="title">{plan.crop} {tx('cropRoadmap') || 'Roadmap'}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{plan.total_duration}</AppText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Row (Primary green tinted cards) */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', borderColor: colors.primary + '30', borderWidth: 1, ...theme.shadow.sm }]}>
            <AppText variant="caption" color={colors.textMuted}>{tx('totalCost') || 'Total Cost'}</AppText>
            <AppText weight="bold" style={{ color: isDark ? colors.primary : colors.primaryDark, marginTop: 4 }}>{plan.total_estimated_cost}</AppText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', borderColor: colors.primary + '30', borderWidth: 1, ...theme.shadow.sm }]}>
            <AppText variant="caption" color={colors.textMuted}>{tx('expYield') || 'Expected Yield'}</AppText>
            <AppText weight="bold" style={{ color: isDark ? '#60a5fa' : '#2563eb', marginTop: 4 }}>{plan.expected_yield}</AppText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', borderColor: colors.primary + '30', borderWidth: 1, ...theme.shadow.sm }]}>
            <AppText variant="caption" color={colors.textMuted}>{tx('profitEst') || 'Profit Estimate'}</AppText>
            <AppText weight="bold" style={{ color: isDark ? '#34d399' : '#059669', marginTop: 4 }}>{plan.profit_estimation}</AppText>
          </View>
        </View>

        {/* Dynamic Checklist Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(109,207,150,0.04)' : colors.primary + '05', borderColor: colors.primary + '15', borderWidth: 1, ...theme.shadow.xs }]}>
          <View style={styles.progressHeader}>
            <AppText variant="label" style={{ fontSize: 13 }}>{tx('progress') || 'Roadmap Progress'}</AppText>
            <AppText variant="label" color={isDark ? colors.primary : colors.primaryDark} style={{ fontSize: 13 }}>{progressPercent}%</AppText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Risk Alerts */}
        {plan.risk_alerts?.length > 0 && (
          <View style={[styles.riskCard, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fee2e2', borderWidth: 1 }]}>
            <View style={styles.riskHeader}>
              <Feather name="alert-triangle" size={18} color={isDark ? '#f87171' : '#ef4444'} />
              <AppText weight="bold" style={{ color: isDark ? '#f87171' : '#991b1b', marginLeft: 8 }}>{tx('criticalRiskAlerts') || 'Risk Alerts'}</AppText>
            </View>
            {plan.risk_alerts.map((risk: string, i: number) => (
              <AppText key={i} variant="caption" style={{ color: isDark ? '#fca5a5' : '#b91c1c', marginTop: 4, textTransform: 'none' }}>• {risk}</AppText>
            ))}
          </View>
        )}

        {/* Timeline (Primary green tinted cards) */}
        <View style={styles.timeline}>
          {plan.stages?.map((stage: any, sIdx: number) => {
            const isExpanded = expandedStage === stage.stage_name;
            return (
              <View key={sIdx} style={styles.stageContainer}>
                <View style={styles.timelineLine}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  {sIdx !== (plan.stages?.length || 1) - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setExpandedStage(isExpanded ? null : stage.stage_name)}
                  style={{ flex: 1 }}
                >
                  <View 
                    style={[
                      styles.stageCard, 
                      { 
                        backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', 
                        borderColor: isExpanded ? colors.primary : colors.primary + '30',
                        borderWidth: 1,
                        ...theme.shadow.sm 
                      }
                    ]}
                  >
                    <View style={styles.stageHeader}>
                      <View style={{ flex: 1 }}>
                        <AppText weight="bold" style={{ fontSize: 16 }}>{stage.stage_name}</AppText>
                        <AppText variant="caption" color={colors.textMuted}>{stage.duration}</AppText>
                      </View>
                      <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
                    </View>

                    {isExpanded && (
                      <View style={styles.stageDetails}>
                        {stage.tasks?.map((task: any, tIdx: number) => {
                          const isTaskDone = !!completedTasks[`${sIdx}-${tIdx}`];
                          return (
                            <View key={tIdx} style={[styles.taskItem, { borderTopColor: colors.border }]}>
                              <View style={styles.taskHeaderContainer}>
                                <TouchableOpacity 
                                  activeOpacity={0.8} 
                                  onPress={() => toggleTaskCompletion(sIdx, tIdx)}
                                  style={styles.checkboxContainer}
                                >
                                  <Feather 
                                    name={isTaskDone ? "check-square" : "square"} 
                                    size={18} 
                                    color={isTaskDone ? colors.primary : colors.textMuted} 
                                  />
                                  <AppText 
                                    weight="bold" 
                                    style={[
                                      styles.taskTitle, 
                                      { 
                                        color: isTaskDone ? colors.textMuted : (isDark ? colors.textOnDark : colors.text),
                                        textDecorationLine: isTaskDone ? 'line-through' : 'none'
                                      }
                                    ]}
                                  >
                                    {task.task}
                                  </AppText>
                                </TouchableOpacity>
                              </View>
                              <AppText style={[styles.taskDetails, { color: isDark ? colors.textMuted : '#4b5563' }]}>
                                {task.details}
                              </AppText>

                              {/* Tools Redirection Loop (Module 3) */}
                              <View style={styles.taskFooter}>
                                <View style={styles.tagWrap}>
                                  {task.tools_required?.map((tool: string, i: number) => (
                                    <TouchableOpacity 
                                      key={i} 
                                      activeOpacity={0.8}
                                      style={[
                                        styles.toolPill, 
                                        { 
                                          backgroundColor: isDark ? 'rgba(109,207,150,0.15)' : colors.primary + '15', 
                                          borderColor: colors.primary + '30', 
                                          borderWidth: 1 
                                        }
                                      ]}
                                      onPress={() => {
                                        navigation.navigate('MarketplaceTab', { search: tool } as any);
                                      }}
                                    >
                                      <Feather name="shopping-bag" size={10} color={colors.primary} style={{ marginRight: 4 }} />
                                      <AppText variant="caption" style={{ color: isDark ? colors.primary : colors.primaryDark, fontSize: 10, textTransform: 'none', fontWeight: 'bold' }}>
                                        {tool}
                                      </AppText>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                                <AppText variant="caption" color={isDark ? colors.primary : colors.primaryDark} weight="bold">{task.estimated_cost}</AppText>
                              </View>

                              {task.tips && (
                                <View style={[styles.tipBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                                  <AppText variant="caption" weight="bold" style={{ color: colors.primary }}>Expert Tip:</AppText>
                                  <AppText variant="caption" color={colors.textMuted} style={{ textTransform: 'none', marginTop: 2 }}>{task.tips}</AppText>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Alternatives (Primary green tinted cards) */}
        <View style={styles.alternatives}>
          <AppText weight="bold" style={{ marginBottom: 12 }}>{tx('alternativeStrategies')}</AppText>
          <View style={{ gap: 12 }}>
            <View style={[styles.altCard, { backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', borderColor: colors.primary + '30', borderWidth: 1, ...theme.shadow.sm }]}>
              <View style={styles.altHeader}>
                <Feather name="trending-down" size={16} color={colors.textMuted} />
                <AppText weight="bold" style={{ marginLeft: 8, fontSize: 13 }}>{tx('lowBudgetApproach')}</AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted} style={{ textTransform: 'none', marginTop: 4 }}>{plan.alternative_suggestions?.low_budget}</AppText>
            </View>
            <View style={[styles.altCard, { backgroundColor: isDark ? 'rgba(109,207,150,0.08)' : colors.primary + '10', borderColor: colors.primary + '30', borderWidth: 1, ...theme.shadow.sm }]}>
              <View style={styles.altHeader}>
                <Feather name="trending-up" size={16} color={colors.primary} />
                <AppText weight="bold" style={{ marginLeft: 8, fontSize: 13, color: colors.primary }}>{tx('highBudgetApproach')}</AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted} style={{ textTransform: 'none', marginTop: 4 }}>{plan.alternative_suggestions?.high_budget}</AppText>
            </View>
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
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  progressContainer: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeline: {
    marginBottom: 16,
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
  },
  taskHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTitle: {
    marginLeft: 10,
    fontSize: 14,
  },
  taskDetails: {
    fontSize: 13,
    lineHeight: 18,
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
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  toolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
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
