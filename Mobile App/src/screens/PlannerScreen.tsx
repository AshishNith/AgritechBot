import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Animated, Alert, Image } from 'react-native';
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
import { Screen, AppText, GradientButton, GlassCard } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api/services';
import { mapBackendTaskToCropTask } from '../utils/plannerUtils';

export const PlannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { language: appLang } = useAppStore();
  const navigation = useNavigation<any>();
  
  const langMap: Record<string, Language> = {
    'English': 'en',
    'Hindi': 'hi',
    'Punjabi': 'pa',
    'Gujarati': 'gu'
  };
  const lang = (langMap[appLang] || 'en') as Language;
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';

  // Queries
  const { data: crops = [] } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });

  const { data: backendTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getTasks(),
  });

  const { data: advisorData } = useQuery({
    queryKey: ['advisor-sync'],
    queryFn: () => apiService.getDashboard(),
  });

  // Mapped Tasks
  const tasks = useMemo(() => {
    return backendTasks.map(bt => {
      const crop = crops.find(c => c._id === bt.userCropId);
      return mapBackendTaskToCropTask({ ...bt, cropType: crop?.cropType });
    });
  }, [backendTasks, crops]);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const theme = getPlannerTheme(themeMode);

  const insight: AIInsight | null = useMemo(() => {
    if (!advisorData) return null;
    return {
      message: advisorData.suggestions[0] || "Your crops are looking healthy. Keep up the good work!",
      chips: advisorData.summary?.highPriorityAlerts > 0 ? ["Weather Alert", "Check Soil"] : ["Stable", "View Roadmap"],
      generatedAt: advisorData.generatedAt
    };
  }, [advisorData]);

  const handleAddTask = async (taskData: any) => {
    setIsModalVisible(false);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Action Restricted", "AI-generated schedules cannot be manually deleted.");
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  if (crops.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <TopBar themeMode={themeMode} />
        <View style={styles.emptyState}>
          <Image 
            source={{ uri: 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1713865000/empty-farm_zxcvbn.png' }}
            style={styles.emptyImage}
            defaultSource={{ uri: 'https://via.placeholder.com/200' }}
          />
          <AppText variant="title" style={{ textAlign: 'center', marginTop: 24 }}>No Crops Registered</AppText>
          <AppText color={theme.text2} style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
            Register your first crop to get a personalized AI farming plan and daily tasks.
          </AppText>
          <GradientButton 
            label="+ Add Your First Crop"
            onPress={() => navigation.navigate('AddCrop')}
            style={{ marginTop: 32, width: 260 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <TopBar 
        themeMode={themeMode}
      />

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[3]}
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
          loading={false} 
          lang={lang} 
          themeMode={themeMode} 
          onRefresh={() => {}}
          onChipPress={(chip) => Alert.alert("Analysis", chip)}
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
              onEdit={(t) => Alert.alert("Details", t.notes || "No details available.")}
              onDelete={handleDeleteTask}
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      <View style={[styles.fab, { bottom: insets.bottom + 20 }]}>
        <GradientButton 
          label={lang === 'hi' ? '+ नया कार्य' : lang === 'pa' ? '+ ਨਵਾਂ ਕੰਮ' : lang === 'gu' ? '+ નવું કાર્ય' : '+ Add Manual Task'}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    opacity: 0.8,
  }
});
