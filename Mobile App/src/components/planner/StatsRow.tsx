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

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'ai-suggested').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filterOptions: Array<{ key: TaskStatus | 'all', label: string, color: string }> = [
    { key: 'all', label: t('totalTasks'), color: theme.accent },
    { key: 'pending', label: t('pending'), color: theme.amber },
    { key: 'completed', label: t('completed'), color: theme.accentMid },
    { key: 'overdue', label: t('overdue'), color: theme.red },
    { key: 'ai-suggested', label: t('aiBadge'), color: theme.purple },
  ];

  return (
    <View style={styles.container}>
      <GlassCard style={[styles.mainCard, { backgroundColor: theme.surface2 }]}>
        <View style={styles.mainRow}>
          <View style={styles.mainStat}>
            <AppText variant="display" style={{ fontSize: 32, color: theme.text }}>{total}</AppText>
            <AppText variant="caption" color={theme.text2}>{t('totalTasks')}</AppText>
          </View>
          <View style={styles.progressWrap}>
            <View style={styles.progressLabels}>
              <AppText variant="caption" weight="bold">{progress}% {t('completed')}</AppText>
              <AppText variant="caption" color={theme.text2}>{completed}/{total}</AppText>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.accent }]} />
            </View>
          </View>
        </View>
      </GlassCard>

      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity 
                onPress={() => onFilter(item.key)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip, 
                  { 
                    backgroundColor: isActive ? item.color : theme.surface,
                    borderColor: isActive ? item.color : theme.border,
                  }
                ]}
              >
                <AppText 
                  style={{ 
                    fontSize: 13, 
                    color: isActive ? '#fff' : theme.text2,
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  {item.label}
                </AppText>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  mainCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainStat: {
    flex: 1,
  },
  progressWrap: {
    flex: 2,
    marginLeft: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
