import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { AppText, GlassCard } from '../ui';
import { Feather } from '@expo/vector-icons';
import { CropTask, Language, ThemeMode } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface WeeklyViewProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ tasks, lang, themeMode }) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const getCategoryIcon = (cat: string) => {
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

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      isWithinInterval(day, { start: new Date(task.startDate), end: new Date(task.endDate) })
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        keyExtractor={(item) => item.toISOString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: day }) => {
          const dayTasks = getTasksForDay(day);
          
          return (
            <View style={styles.dayRow}>
              <View style={styles.dayHeader}>
                <AppText weight="bold" style={{ color: theme.text }}>{format(day, 'EEEE')}</AppText>
                <AppText style={{ color: theme.text3, fontSize: 12 }}>{format(day, 'MMM d')}</AppText>
              </View>
              
              {dayTasks.length > 0 ? (
                dayTasks.map((task) => (
                  <GlassCard key={task.id} style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.categoryIcon}>
                      <Feather name={getCategoryIcon(task.category) as any} size={14} color={getStatusColor(task.status)} />
                    </View>
                    <View style={styles.taskInfo}>
                      <AppText weight="bold" style={{ fontSize: 14 }}>{task.titleTranslations[lang] || task.title}</AppText>
                      <AppText style={{ fontSize: 12, color: theme.text2 }}>{task.cropName} • {task.fieldName}</AppText>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: getStatusColor(task.status) + '22' }]}>
                      <AppText style={{ fontSize: 10, color: getStatusColor(task.status), fontWeight: '700' }}>{task.progress}%</AppText>
                    </View>
                  </GlassCard>
                ))
              ) : (
                <AppText style={[styles.noTasks, { color: theme.text3 }]}>{t('noTasks')}</AppText>
              )}
            </View>
          );
        }}
      />
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
  dayRow: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  taskInfo: {
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noTasks: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 4,
  },
});
