import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { AppText, GlassCard } from '../ui';
import { Language, ThemeMode, CropTask, TaskStatus } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface StatsRowProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
  onFilter: (status: TaskStatus | 'all') => void;
  activeFilter: TaskStatus | 'all';
}

export const StatsRow: React.FC<StatsRowProps> = ({ tasks, lang, themeMode, onFilter, activeFilter }) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const stats = [
    { 
      key: 'all', 
      label: t('totalTasks'), 
      count: tasks.length, 
      color: theme.accent, 
      bgColor: theme.accentLight 
    },
    { 
      key: 'pending', 
      label: t('pending'), 
      count: tasks.filter(t => t.status === 'pending').length, 
      color: theme.amber, 
      bgColor: theme.amberLight 
    },
    { 
      key: 'overdue', 
      label: t('overdue'), 
      count: tasks.filter(t => t.status === 'overdue').length, 
      color: theme.red, 
      bgColor: theme.redLight 
    },
    { 
      key: 'ai-suggested', 
      label: t('aiBadge'), 
      count: tasks.filter(t => t.status === 'ai-suggested').length, 
      color: theme.purple, 
      bgColor: theme.purpleLight 
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={stats}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => onFilter(item.key as any)}
            activeOpacity={0.7}
          >
            <GlassCard 
              style={[
                styles.statCard, 
                { 
                  backgroundColor: theme.surface,
                  borderColor: activeFilter === item.key ? item.color : theme.border,
                  borderWidth: activeFilter === item.key ? 1.5 : 1,
                }
              ]}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <AppText variant="display" style={{ fontSize: 20 }}>
                {item.count}
              </AppText>
              <AppText color={theme.text2} style={{ fontSize: 12 }}>
                {item.label}
              </AppText>
            </GlassCard>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 100,
    padding: 12,
    borderRadius: 20,
    alignItems: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});
