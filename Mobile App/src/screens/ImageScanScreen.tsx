import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IconMap } from '../components/IconMap';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';

export function ImageScanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  return (
    <Screen dark>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
        >
          {(() => {
            const IconComp = IconMap['ArrowLeft'];
            return IconComp ? <IconComp size={22} color={colors.textOnDark} /> : null;
          })()}
        </Pressable>
      </View>

      <View style={styles.content}>
        <ScreenCard style={styles.card}>
          <AppText variant="heading">Crop scanning is not live yet</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 10, textAlign: 'center' }}>
            We removed the demo diagnosis flow from launch mode so the app only exposes features that are backed by real analysis.
          </AppText>
          <GradientButton
            label="Return to Voice Assistant"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          />
        </ScreenCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
  },
});
