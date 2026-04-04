import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '../ui';
import { ViewMode, Language, ThemeMode } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface ViewTabsProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  lang: Language;
  themeMode: ThemeMode;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ 
  activeView, setActiveView, lang, themeMode 
}) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const tabs: { key: ViewMode; label: string }[] = [
    { key: 'gantt', label: t('ganttTab') },
    { key: 'weekly', label: t('weeklyTab') },
    { key: 'monthly', label: t('monthlyTab') },
    { key: 'list', label: t('listTab') },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.tabContent, { backgroundColor: theme.surface2 }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveView(tab.key)}
            style={[
              styles.tab,
              activeView === tab.key && { backgroundColor: theme.surface }
            ]}
          >
            <AppText 
              weight={activeView === tab.key ? 'bold' : 'regular'}
              style={[
                styles.tabText, 
                { color: activeView === tab.key ? theme.accent : theme.text2 }
              ]}
            >
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabContent: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 13,
  },
});
