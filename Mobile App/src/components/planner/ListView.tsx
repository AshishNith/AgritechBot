import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { AppText, GlassCard } from '../ui';
import { CropTask, Language, ThemeMode, TaskCategory } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface ListViewProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
  onEdit: (task: CropTask) => void;
  onDelete: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ 
  tasks, lang, themeMode, onEdit, onDelete 
}) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'sowing': return 'grid';
      case 'irrigation': return 'droplet';
      case 'fertilizer': return 'package';
      case 'pesticide': return 'shield';
      case 'harvest': return 'scissors';
      default: return 'check-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return theme.accent;
      case 'pending': return theme.amber;
      case 'overdue': return theme.red;
      case 'ai-suggested': return theme.purple;
      default: return theme.text2;
    }
  };

  return (
    <View style={styles.container}>
      {sortedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={{ color: theme.text3 }}>{t('noTasks')}</AppText>
        </View>
      ) : (
        <View style={styles.listContent}>
          {sortedTasks.map((task) => (
            <GlassCard key={task.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.leftLine}>
                <View style={[styles.categoryIcon, { backgroundColor: theme.surface2 }]}>
                  <Feather name={getCategoryIcon(task.category)} size={16} color={getStatusColor(task.status)} />
                </View>
                <View style={[styles.connector, { backgroundColor: theme.border }]} />
              </View>

              <View style={styles.content}>
                <View style={styles.row}>
                  <AppText weight="bold" style={{ fontSize: 16 }}>
                    {task.titleTranslations[lang] || task.title}
                  </AppText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '22', borderColor: getStatusColor(task.status) }]}>
                    <AppText style={{ fontSize: 10, color: getStatusColor(task.status), fontWeight: '700' }}>
                      {task.status.toUpperCase()}
                    </AppText>
                  </View>
                </View>

                <AppText style={{ fontSize: 12, color: theme.text2, marginBottom: 8 }}>
                  {task.cropName} • {task.fieldName}
                </AppText>

                <View style={styles.footer}>
                  <View style={styles.dateRow}>
                    <Feather name="calendar" size={12} color={theme.text3} />
                    <AppText style={{ fontSize: 12, color: theme.text3 }}>
                      {format(parseISO(task.startDate), 'MMM d')} - {format(parseISO(task.endDate), 'MMM d')}
                    </AppText>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionBtn}>
                      <Feather name="edit-2" size={14} color={theme.text2} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.actionBtn}>
                      <Feather name="trash-2" size={14} color={theme.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
  },
  leftLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connector: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 36,
    bottom: -30,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
