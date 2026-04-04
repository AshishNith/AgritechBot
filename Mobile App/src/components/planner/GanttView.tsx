import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { AppText } from '../ui';
import { CropTask, Language, ThemeMode, TaskCategory } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';

const COLUMN_WIDTH = 40;
const LEFT_LABEL_WIDTH = 100;

interface GanttViewProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
}

export const GanttView: React.FC<GanttViewProps> = ({ tasks, lang, themeMode }) => {
  const theme = getPlannerTheme(themeMode);
  
  // Create a 30-day window from today
  const today = new Date();
  const startDate = startOfMonth(today);
  const endDate = addDays(startDate, 30);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getCategoryColor = (cat: TaskCategory) => {
    switch(cat) {
      case 'sowing': return '#4a9e5a';
      case 'irrigation': return '#3b82f6';
      case 'fertilizer': return '#f59e0b';
      case 'pesticide': return '#ef4444';
      case 'harvest': return '#8b5cf6';
      default: return '#9a9890';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <View style={[styles.cornerBox, { width: LEFT_LABEL_WIDTH, borderRightColor: theme.border }]}>
          <AppText weight="bold" style={{ fontSize: 12, color: theme.text2 }}>CROP</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          {days.map((day, i) => (
            <View key={i} style={[styles.dayCol, { width: COLUMN_WIDTH, borderRightColor: theme.border }]}>
              <AppText style={[styles.dayText, { color: theme.text3 }]}>{format(day, 'd')}</AppText>
              <AppText weight="bold" style={[styles.dayLabel, { color: isSameDay(day, today) ? theme.accent : theme.text2 }]}>
                {format(day, 'EE').charAt(0)}
              </AppText>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tasks.map((task) => {
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);
          const offsetDays = differenceInDays(taskStart, startDate);
          const durationDays = differenceInDays(taskEnd, taskStart) + 1;

          return (
            <View key={task.id} style={[styles.row, { borderBottomColor: theme.border }]}>
              <View style={[styles.leftLabel, { width: LEFT_LABEL_WIDTH, borderRightColor: theme.border }]}>
                <AppText numberOfLines={1} weight="bold" style={{ fontSize: 13, color: theme.text }}>
                  {task.cropName}
                </AppText>
                <AppText numberOfLines={1} style={{ fontSize: 11, color: theme.text2 }}>
                  {task.titleTranslations[lang] || task.title}
                </AppText>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={[styles.timelineTrack, { width: days.length * COLUMN_WIDTH }]}>
                  <View 
                    style={[
                      styles.taskBar, 
                      { 
                        left: offsetDays * COLUMN_WIDTH + 4, 
                        width: durationDays * COLUMN_WIDTH - 8,
                        backgroundColor: getCategoryColor(task.category),
                      }
                    ]}
                  >
                    <View style={[styles.progressBar, { width: `${task.progress}%` }]} />
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cornerBox: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
  },
  dayCol: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  dayText: {
    fontSize: 10,
  },
  dayLabel: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
  },
  leftLabel: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  timelineTrack: {
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  taskBar: {
    height: 24,
    borderRadius: 6,
    position: 'absolute',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
    left: 0,
  },
});
