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
        <View style={styles.bgIcon}>
          <MaterialCommunityIcons name="robot" size={80} color={theme.purple + '08'} />
        </View>

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.aiIconWrap, { backgroundColor: theme.purple + '15' }]}>
              <MaterialCommunityIcons name="robot" size={18} color={theme.purple} />
            </View>
            <View>
              <AppText weight="bold" style={{ color: theme.purple, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('todaySuggestion')}
              </AppText>
              <AppText variant="caption" color={theme.text2}>AI Farming Assistant</AppText>
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} disabled={loading} style={styles.refreshBtn}>
            <Feather 
              name="refresh-cw" 
              size={16} 
              color={loading ? theme.text3 : theme.purple} 
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.skeleton}>
            <View style={[styles.skeletonLine, { backgroundColor: theme.surface2, width: '90%' }]} />
            <View style={[styles.skeletonLine, { backgroundColor: theme.surface2, width: '70%' }]} />
          </View>
        ) : (
          <View style={styles.content}>
            <AppText style={[styles.message, { color: theme.text }]}>
              "{insight?.message}"
            </AppText>
            
            <View style={styles.chipsRow}>
              {insight?.chips.map((chip, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => onChipPress(chip)}
                  style={[styles.chip, { backgroundColor: theme.purpleLight, borderColor: theme.purple + '20' }]}
                >
                  <AppText style={[styles.chipText, { color: theme.purple }]}>
                    {chip}
                  </AppText>
                  <Feather name="arrow-up-right" size={10} color={theme.purple} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    padding: 18,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  bgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  content: {
    zIndex: 1,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    color: '#374151',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
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
