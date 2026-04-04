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
    <View style={[styles.container, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Feather name="layers" size={20} color={theme.accent} />
        <AppText style={[styles.appName, { color: theme.accent }]}>
          Anaaj AI
        </AppText>
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface2 }]}>
          <Feather name="search" size={18} color={theme.text2} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface2 }]}>
          <Feather name="more-vertical" size={18} color={theme.text2} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    marginRight: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
