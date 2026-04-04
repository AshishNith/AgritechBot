import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/planner/TopBar';
import { StatsRow } from '../components/planner/StatsRow';
import { AIInsightCard } from '../components/planner/AIInsightCard';
import { ViewTabs } from '../components/planner/ViewTabs';
import { GanttView } from '../components/planner/GanttView';
import { WeeklyView } from '../components/planner/WeeklyView';
import { MonthlyView } from '../components/planner/MonthlyView';
import { ListView } from '../components/planner/ListView';
import { AddTaskModal } from '../components/planner/AddTaskModal';
import { 
  CropTask, Language, ThemeMode, ViewMode, TaskStatus, AIInsight 
} from '../types/planner';
import { getPlannerTheme } from '../constants/plannerTheme';
import { sampleTasks } from '../constants/cropTasks';
import { getAIDailyInsight } from '../services/geminiPlanner';
import { Screen, AppText, GradientButton } from '../components/ui';

import { useTheme } from '../providers/ThemeContext';
import { useAppStore } from '../store/useAppStore';

const STORAGE_KEY = '@anaaj_planner_tasks';

export const PlannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { language: appLang } = useAppStore();
  
  const langMap: Record<string, Language> = {
    'English': 'en',
    'Hindi': 'hi',
    'Punjabi': 'pa',
    'Gujarati': 'gu'
  };
  const lang = (langMap[appLang] || 'en') as Language;
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';

  // State
  const [tasks, setTasks] = useState<CropTask[]>(sampleTasks);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const theme = getPlannerTheme(themeMode);

  // Persistence
  useEffect(() => {
    loadData();
    fetchAIInsight();
  }, [lang]);

  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const saveData = async (newTasks: CropTask[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const fetchAIInsight = async () => {
    setLoadingInsight(true);
    try {
      const crops = [...new Set(tasks.map(t => t.cropName))];
      const data = await getAIDailyInsight({
        crops: crops.length > 0 ? crops : ['Wheat'],
        language: lang,
        season: 'Rabi' // Detect dynamically in real app
      });
      setInsight(data);
    } catch (e) {
      console.error('AI Insight error', e);
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleAddTask = (taskData: Partial<CropTask>) => {
    const newTask: CropTask = {
      ...taskData,
      id: Date.now().toString(),
      titleTranslations: {
        en: taskData.title || '',
        hi: taskData.title || '',
        pa: taskData.title || '',
        gu: taskData.title || '',
      }
    } as CropTask;
    
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveData(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        const updated = tasks.filter(t => t.id !== taskId);
        setTasks(updated);
        saveData(updated);
      }}
    ]);
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <TopBar 
        themeMode={themeMode}
      />

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[3]} // Stick the ViewTabs
      >
        <StatsRow 
          tasks={tasks} 
          lang={lang} 
          themeMode={themeMode} 
          activeFilter={filter}
          onFilter={setFilter}
        />

        <AIInsightCard 
          insight={insight} 
          loading={loadingInsight} 
          lang={lang} 
          themeMode={themeMode} 
          onRefresh={fetchAIInsight}
          onChipPress={(chip) => Alert.alert("AI Chip", chip)}
        />

        <View style={{ height: 16 }} />

        <ViewTabs 
          activeView={viewMode} 
          setActiveView={setViewMode} 
          lang={lang} 
          themeMode={themeMode} 
        />

        <View style={styles.viewContainer}>
          {viewMode === 'gantt' && <GanttView tasks={filteredTasks} lang={lang} themeMode={themeMode} />}
          {viewMode === 'weekly' && <WeeklyView tasks={filteredTasks} lang={lang} themeMode={themeMode} />}
          {viewMode === 'monthly' && <MonthlyView tasks={filteredTasks} lang={lang} themeMode={themeMode} />}
          {viewMode === 'list' && (
            <ListView 
              tasks={filteredTasks} 
              lang={lang} 
              themeMode={themeMode} 
              onEdit={(t) => Alert.alert("Edit", t.title)}
              onDelete={handleDeleteTask}
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      <View style={[styles.fab, { bottom: insets.bottom + 20 }]}>
        <GradientButton 
          label={lang === 'hi' ? '+ नया कार्य' : lang === 'pa' ? '+ ਨਵਾਂ ਕੰਮ' : lang === 'gu' ? '+ નવું કાર્ય' : '+ Add Task'}
          onPress={() => setIsModalVisible(true)}
          style={{ width: 220 }}
        />
      </View>

      <AddTaskModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddTask}
        lang={lang}
        themeMode={themeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    minHeight: 500,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
