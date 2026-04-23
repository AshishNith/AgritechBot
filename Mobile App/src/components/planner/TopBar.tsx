import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '../ui';
import { ThemeMode } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { useNavigation } from '@react-navigation/native';

interface TopBarProps {
  themeMode: ThemeMode;
}

export const TopBar: React.FC<TopBarProps> = ({ themeMode }) => {
  const theme = getPlannerTheme(themeMode);
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface2 }]}>
          <Feather name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <View>
          <AppText variant="title" style={[styles.appName, { color: theme.text }]}>
            Farm Planner
          </AppText>
          <AppText variant="caption" style={{ color: theme.accent, fontWeight: '700' }}>
            ANAAJ AI ASSISTANT
          </AppText>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface2 }]}>
          <Feather name="bell" size={18} color={theme.text2} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface2 }]}>
          <Feather name="settings" size={18} color={theme.text2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
