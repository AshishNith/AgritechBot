import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GlassCard } from '../ui';
import { ThemeMode, Language, AIInsight } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface AIInsightCardProps {
  insight: AIInsight | null;
  loading: boolean;
  lang: Language;
  themeMode: ThemeMode;
  onRefresh: () => void;
  onChipPress: (chip: string) => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ 
  insight, loading, lang, themeMode, onRefresh, onChipPress 
}) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  return (
    <View style={styles.container}>
      <GlassCard 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.surface,
            borderLeftWidth: 4,
            borderLeftColor: theme.purple,
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="robot" size={20} color={theme.purple} />
            <AppText weight="bold" style={{ color: theme.purple, fontSize: 14 }}>
              {t('todaySuggestion')}
            </AppText>
          </View>
          <TouchableOpacity onPress={onRefresh} disabled={loading}>
            <Feather 
              name="refresh-cw" 
              size={16} 
              color={loading ? theme.text3 : theme.text2} 
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.skeleton}>
            <View style={[styles.skeletonLine, { backgroundColor: theme.surface2, width: '90%' }]} />
            <View style={[styles.skeletonLine, { backgroundColor: theme.surface2, width: '70%' }]} />
          </View>
        ) : (
          <>
            <AppText style={[styles.message, { color: theme.text }]}>
              {insight?.message}
            </AppText>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {insight?.chips.map((chip, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => onChipPress(chip)}
                  style={[styles.chip, { backgroundColor: theme.purpleLight, borderColor: theme.purple }]}
                >
                  <AppText style={[styles.chipText, { color: theme.purple }]}>
                    {chip}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  chipsScroll: {
    marginTop: 4,
  },
  chipsContainer: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeleton: {
    gap: 8,
    paddingVertical: 4,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
});
