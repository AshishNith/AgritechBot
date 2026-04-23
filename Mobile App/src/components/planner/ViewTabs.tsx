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
    { key: 'list', label: t('listTab') },
    { key: 'weekly', label: t('weeklyTab') },
    { key: 'monthly', label: t('monthlyTab') },
    { key: 'gantt', label: t('ganttTab') },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.tabContent, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
        {tabs.map((tab) => {
          const isActive = activeView === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.9}
              onPress={() => setActiveView(tab.key)}
              style={[
                styles.tab,
                isActive && [styles.activeTab, { backgroundColor: theme.surface }]
              ]}
            >
              <AppText 
                weight={isActive ? 'bold' : 'medium'}
                style={[
                  styles.tabText, 
                  { color: isActive ? theme.accent : theme.text2 }
                ]}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tabContent: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
  },
});
