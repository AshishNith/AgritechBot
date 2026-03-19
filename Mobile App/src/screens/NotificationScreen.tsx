import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { theme } from '../constants/theme';

const tabs = ['Crop Alerts', 'Weather', 'AI Suggestions'];
const alerts = [
  { title: 'Pest Risk Detected', subtitle: 'High probability of aphids', time: '2h ago', action: 'Take Action' },
  { title: 'Irrigation Update', subtitle: 'Soil moisture at 72%', time: '5h ago', action: 'Dismiss' },
  { title: 'AI Yield Insight', subtitle: '12% yield increase projected', time: '1d ago', action: 'View Analysis' },
  { title: 'Frost Warning', subtitle: 'Temperature below 4°C', time: '1d ago', action: 'Dismiss' },
];

export function NotificationScreen() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="heading">Notifications</AppText>
        <View style={styles.langRow}>
          {['EN', 'ES', 'FR'].map((item) => (
            <AppText key={item} color={theme.colors.textMuted}>
              {item}
            </AppText>
          ))}
        </View>
      </View>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, tab === activeTab && styles.tabActive]}>
            <AppText variant="label" color={tab === activeTab ? theme.colors.textOnDark : theme.colors.textMuted}>
              {tab}
            </AppText>
          </Pressable>
        ))}
      </View>
      <AppText variant="caption" color={theme.colors.textMuted} style={{ marginBottom: 12 }}>
        Today
      </AppText>
      <View style={{ gap: 12 }}>
        {alerts.map((item, index) => (
          <ScreenCard key={item.title} style={styles.alertCard}>
            <View style={[styles.alertIcon, index % 3 === 0 && { backgroundColor: 'rgba(239,68,68,0.14)' }, index % 3 === 1 && { backgroundColor: 'rgba(37,99,235,0.12)' }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.alertHeader}>
                <AppText variant="label">{item.title}</AppText>
                <AppText color={theme.colors.textMuted}>{item.time}</AppText>
              </View>
              <AppText color={theme.colors.textMuted}>{item.subtitle}</AppText>
              <GradientButton label={item.action} secondary style={{ marginTop: 14 }} />
            </View>
          </ScreenCard>
        ))}
      </View>
      <ScreenCard style={styles.suggestionCard}>
        <AppText variant="label" color={theme.colors.textOnDark}>
          New AI Insights Available
        </AppText>
        <AppText color="#ddf4e8" style={{ marginTop: 8 }}>
          Your crop health summary has changed in the last 24 hours. Open the assistant for updated advice.
        </AppText>
      </ScreenCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(82,183,129,0.14)',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  suggestionCard: {
    marginTop: 18,
    backgroundColor: theme.colors.primaryDark,
    paddingBottom: 120,
  },
});
