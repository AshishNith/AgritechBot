import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { apiService } from '../api/services';
import { AppText, GradientButton, Pill, Screen, ScreenCard, StatCard } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { FarmingTask } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskTimeline'>;
type StatusFilter = 'all' | 'pending' | 'completed' | 'skipped' | 'missed';

const STATUS_OPTIONS: StatusFilter[] = ['all', 'pending', 'completed', 'skipped', 'missed'];
const PRIORITY_OPTIONS: Array<FarmingTask['priority']> = ['low', 'medium', 'high'];
const REPEAT_OPTIONS: Array<NonNullable<FarmingTask['repeat']>> = ['none', 'daily', 'weekly'];

function formatGroupLabel(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function getTaskTypeIcon(taskType: FarmingTask['taskType']) {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    watering: 'water-outline',
    fertilizing: 'flask-outline',
    pesticide: 'bug-outline',
    weeding: 'cut-outline',
    harvesting: 'basket-outline',
    maintenance: 'construct-outline',
  };

  return iconMap[taskType] || 'list-outline';
}

function getStatusAccent(status: FarmingTask['status'], colors: ReturnType<typeof useTheme>['colors']) {
  if (status === 'completed') return colors.success;
  if (status === 'skipped') return colors.warning;
  if (status === 'missed') return colors.danger;
  return colors.primary;
}

function getPriorityAccent(priority: FarmingTask['priority'], colors: ReturnType<typeof useTheme>['colors']) {
  if (priority === 'high') return colors.danger;
  if (priority === 'medium') return colors.warning;
  return colors.info;
}

export function TaskTimelineScreen({ route }: Props) {
  const { cropId } = route.params;
  const queryClient = useQueryClient();
  const { colors, isDark } = useTheme();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingTask, setEditingTask] = useState<FarmingTask | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPriority, setFormPriority] = useState<FarmingTask['priority']>('medium');
  const [formRepeat, setFormRepeat] = useState<NonNullable<FarmingTask['repeat']>>('none');
  const [formReminder, setFormReminder] = useState('30');

  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', cropId, statusFilter],
    queryFn: () =>
      apiService.getTasks({
        cropId,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof apiService.updateTask>[1];
    }) => apiService.updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, FarmingTask[]>();
    (tasks || []).forEach((task) => {
      const key = task.scheduledDate.slice(0, 10);
      const bucket = groups.get(key) || [];
      bucket.push(task);
      groups.set(key, bucket);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      label: formatGroupLabel(date),
      items,
    }));
  }, [tasks]);

  const schedulerSummary = useMemo(() => {
    const all = tasks || [];
    return {
      total: all.length,
      pending: all.filter((task) => task.status === 'pending').length,
      adaptive: all.filter((task) => task.source === 'adaptive').length,
      completed: all.filter((task) => task.status === 'completed').length,
    };
  }, [tasks]);

  const openEditor = (task: FarmingTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormDate(task.scheduledDate.slice(0, 16));
    setFormPriority(task.priority);
    setFormRepeat(task.repeat || 'none');
    setFormReminder(String(task.reminderMinutesBefore || 30));
  };

  const saveTask = () => {
    if (!editingTask) return;

    const isoDate = formDate.includes('T') ? new Date(formDate).toISOString() : editingTask.scheduledDate;

    updateTaskMutation.mutate({
      taskId: editingTask._id,
      payload: {
        title: formTitle.trim(),
        description: formDescription.trim(),
        scheduledDate: isoDate,
        priority: formPriority,
        repeat: formRepeat,
        reminderMinutesBefore: Number(formReminder) || 30,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen headerProps={{ title: 'Scheduler', showBack: true }}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.backgroundAlt] : ['#edf7f0', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <FlatList
        data={groupedTasks}
        keyExtractor={(item) => item.date}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={isDark ? ['#173023', '#0d1d15'] : ['#1f7b54', '#52b781']}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color="rgba(255,255,255,0.74)">
                    Smart Farming Planner
                  </AppText>
                  <AppText variant="title" color="#fff" style={{ marginTop: 6 }}>
                    Your assistant scheduler
                  </AppText>
                  <AppText color="rgba(255,255,255,0.82)" style={{ marginTop: 6 }}>
                    Keep field work aligned with AI plans, reminders, and adaptive updates.
                  </AppText>
                </View>
                <View style={styles.heroIconWrap}>
                  <Ionicons name="calendar-clear-outline" size={28} color="#fff" />
                </View>
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <AppText variant="label" color="#fff" style={styles.heroStatValue}>
                    {schedulerSummary.total}
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.68)">
                    Total Tasks
                  </AppText>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <AppText variant="label" color="#fff" style={styles.heroStatValue}>
                    {schedulerSummary.pending}
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.68)">
                    Pending
                  </AppText>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <AppText variant="label" color="#fff" style={styles.heroStatValue}>
                    {schedulerSummary.adaptive}
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.68)">
                    Adaptive
                  </AppText>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.statGrid}>
              <StatCard label="Completed" value={String(schedulerSummary.completed)} icon="CheckCircle2" color={colors.success} />
              <StatCard label="Upcoming" value={String(schedulerSummary.pending)} icon="Clock3" color={colors.warning} />
            </View>

            <ScreenCard
              style={[
                styles.filterCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText variant="label">Filter By Status</AppText>
              <View style={styles.filterRow}>
                {STATUS_OPTIONS.map((status) => (
                  <Pill
                    key={status}
                    label={status[0].toUpperCase() + status.slice(1)}
                    active={statusFilter === status}
                    onPress={() => setStatusFilter(status)}
                    style={statusFilter === status ? styles.activeFilterPill : undefined}
                  />
                ))}
              </View>
            </ScreenCard>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.groupSection, index === 0 && { marginTop: 2 }]}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupMarker, { backgroundColor: colors.primary }]} />
              <AppText variant="label" style={styles.groupTitle}>
                {item.label}
              </AppText>
            </View>

            <View style={styles.timelineColumn}>
              {item.items.map((task, taskIndex) => (
                <View key={task._id} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: getStatusAccent(task.status, colors) }]} />
                    {taskIndex !== item.items.length - 1 ? (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                        ]}
                      />
                    ) : null}
                  </View>

                  <TaskCard
                    task={task}
                    onEdit={() => openEditor(task)}
                    onQuickUpdate={(status) =>
                      updateTaskMutation.mutate({
                        taskId: task._id,
                        payload: { status },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <ScreenCard
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.surface,
              },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '14' }]}>
              <Ionicons name="calendar-outline" size={26} color={colors.primary} />
            </View>
            <AppText variant="label" style={{ marginTop: 12 }}>
              No scheduled tasks
            </AppText>
            <AppText color={colors.textMuted} style={{ marginTop: 6, textAlign: 'center' }}>
              There are no tasks for the current filter. Try another status or generate a fresh AI schedule.
            </AppText>
          </ScreenCard>
        }
      />

      <Modal visible={!!editingTask} transparent animationType="slide" onRequestClose={() => setEditingTask(null)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#111915' : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="title">Edit Task</AppText>
                <AppText color={colors.textMuted} style={{ marginTop: 4 }}>
                  Update schedule details, repeat rules, and reminder timing.
                </AppText>
              </View>
              <Pressable
                onPress={() => setEditingTask(null)}
                style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted }]}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <TextInput
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="Task title"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <TextInput
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Task details"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              multiline
            />

            <TextInput
              value={formDate}
              onChangeText={setFormDate}
              placeholder="YYYY-MM-DDTHH:mm"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <AppText variant="caption" color={colors.textMuted}>
              Priority
            </AppText>
            <View style={styles.pillWrap}>
              {PRIORITY_OPTIONS.map((priority) => (
                <Pill
                  key={priority}
                  label={priority}
                  active={formPriority === priority}
                  onPress={() => setFormPriority(priority)}
                />
              ))}
            </View>

            <AppText variant="caption" color={colors.textMuted}>
              Repeat
            </AppText>
            <View style={styles.pillWrap}>
              {REPEAT_OPTIONS.map((repeat) => (
                <Pill
                  key={repeat}
                  label={repeat}
                  active={formRepeat === repeat}
                  onPress={() => setFormRepeat(repeat)}
                />
              ))}
            </View>

            <TextInput
              value={formReminder}
              onChangeText={setFormReminder}
              placeholder="Reminder minutes before"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <GradientButton label="Cancel" secondary onPress={() => setEditingTask(null)} style={{ flex: 1 }} />
              <GradientButton
                label={updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
                onPress={saveTask}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function TaskCard({
  task,
  onEdit,
  onQuickUpdate,
}: {
  task: FarmingTask;
  onEdit: () => void;
  onQuickUpdate: (status: FarmingTask['status']) => void;
}) {
  const { colors, isDark } = useTheme();
  const statusAccent = getStatusAccent(task.status, colors);
  const priorityAccent = getPriorityAccent(task.priority, colors);

  return (
    <ScreenCard
      style={[
        styles.taskCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <View style={[styles.taskIconBadge, { backgroundColor: statusAccent + '18' }]}>
            <Ionicons name={getTaskTypeIcon(task.taskType)} size={18} color={statusAccent} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.taskTitleTop}>
              <AppText variant="label" style={{ flex: 1 }}>
                {task.title}
              </AppText>
              <View style={[styles.statusTag, { backgroundColor: statusAccent + '14' }]}>
                <AppText variant="caption" color={statusAccent}>
                  {task.status}
                </AppText>
              </View>
            </View>

            <AppText color={colors.textMuted} style={{ marginTop: 4 }}>
              {new Date(task.scheduledDate).toLocaleString()}
            </AppText>
          </View>

          <Pressable
            onPress={onEdit}
            style={[
              styles.editBtn,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted },
            ]}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <AppText color={colors.textMuted} style={{ marginTop: 10 }}>
        {task.description}
      </AppText>

      <View style={styles.metaRow}>
        <View style={[styles.metaChip, { backgroundColor: priorityAccent + '12' }]}>
          <Ionicons name="flag-outline" size={14} color={priorityAccent} />
          <AppText variant="caption" color={priorityAccent}>
            {task.priority}
          </AppText>
        </View>

        <View style={[styles.metaChip, { backgroundColor: colors.primary + '12' }]}>
          <Ionicons name="repeat-outline" size={14} color={colors.primary} />
          <AppText variant="caption" color={colors.primary}>
            {task.repeat || 'none'}
          </AppText>
        </View>

        <View
          style={[
            styles.metaChip,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted },
          ]}
        >
          <Ionicons name="notifications-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textMuted}>
            {task.reminderMinutesBefore || 30}m
          </AppText>
        </View>
      </View>

      {task.aiReason ? (
        <View
          style={[
            styles.aiReasonBox,
            {
              backgroundColor: isDark ? 'rgba(251,179,43,0.08)' : 'rgba(245,158,11,0.08)',
              borderColor: isDark ? 'rgba(251,179,43,0.18)' : 'rgba(245,158,11,0.18)',
            },
          ]}
        >
          <Ionicons name="sparkles-outline" size={15} color={colors.warning} />
          <AppText color={colors.warning} style={{ flex: 1 }}>
            {task.aiReason}
          </AppText>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onQuickUpdate('skipped')}
          style={[
            styles.secondaryAction,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted },
          ]}
        >
          <AppText variant="caption" color={colors.textMuted}>
            Skip
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onQuickUpdate('missed')}
          style={[styles.secondaryAction, { backgroundColor: colors.danger + '12' }]}
        >
          <AppText variant="caption" color={colors.danger}>
            Missed
          </AppText>
        </Pressable>

        <Pressable onPress={() => onQuickUpdate('completed')} style={[styles.primaryAction, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 4 }} />
          <AppText variant="caption" color="#fff">
            Complete
          </AppText>
        </Pressable>
      </View>
    </ScreenCard>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    marginTop: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  heroDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  filterCard: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  activeFilterPill: {
    transform: [{ scale: 1.02 }],
  },
  groupSection: {
    marginTop: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  groupMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  groupTitle: {
    fontSize: 15,
  },
  timelineColumn: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  timelineRail: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    borderRadius: 999,
  },
  taskCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
  },
  taskHeader: {
    gap: 6,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  taskIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  aiReasonBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  secondaryAction: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyCard: {
    marginTop: 18,
    padding: 28,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    borderRadius: 28,
    padding: 18,
    gap: 12,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
