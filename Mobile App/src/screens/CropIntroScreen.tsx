import { IconMap } from '../components/IconMap';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText, GradientButton, ProgressDots, Screen, ScreenCard } from '../components/ui';
import { designImages } from '../constants/designData';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CropIntro'>;

const featureCards: Array<{
  icon: any;
  title: string;
  subtitle: string;
  active?: boolean;
}> = [
  { icon: 'Sprout', title: 'Soil Health', subtitle: 'AI Nutrients Analysis' },
  { icon: 'Bug', title: 'Pest Control', subtitle: 'Smart Detection' },
  { icon: 'LineChart', title: 'Yield Forecast', subtitle: 'Market Prediction' },
  { icon: 'Leaf', title: 'Crop Type', subtitle: 'Personalized Selection', active: true },
];

export function CropIntroScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <Screen scrollable>
      <ImageBackground source={{ uri: designImages.cropIntro }} style={styles.hero} imageStyle={{ borderRadius: 30 }}>
        <View style={styles.overlay} />
      </ImageBackground>
      <View style={styles.content}>
        <AppText variant="title" style={styles.centered}>
          Get Expert AI Advice
        </AppText>
        <AppText color={colors.textMuted} style={styles.centered}>
          विशेषज्ञ एआई सलाह प्राप्त करें
        </AppText>
        <View style={styles.grid}>
          {featureCards.map((card) => (
            <ScreenCard key={card.title} style={[styles.featureCard, card.active && [styles.featureCardActive, { backgroundColor: colors.primary }]]}>
              <View style={[styles.iconBox, card.active && [styles.iconBoxActive, { backgroundColor: 'rgba(255,255,255,0.16)' }]]}>
                {(() => { const IconComp = IconMap[card.icon]; return IconComp ? <IconComp size={24} color={card.active ? colors.textOnDark : colors.primaryDark} /> : null; })()}
              </View>
              <AppText variant="label" color={card.active ? colors.textOnDark : colors.text}>
                {card.title}
              </AppText>
              <AppText color={card.active ? '#d9f3e4' : colors.textMuted}>{card.subtitle}</AppText>
            </ScreenCard>
          ))}
        </View>
      </View>
      <View style={styles.bottom}>
        <ProgressDots total={3} active={1} />
        <GradientButton label="Continue to Advisor" onPress={() => navigation.navigate('Login')} style={{ marginTop: 18 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 290,
    marginTop: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16,33,23,0.16)',
    borderRadius: 30,
  },
  content: {
    marginTop: 24,
  },
  centered: { textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
  },
  featureCard: {
    width: '47.5%',
    minHeight: 151,
    gap: 12,
    justifyContent: 'space-between',
  },
  featureCardActive: {
    // Background set dynamically
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(82,183,129,0.14)',
  },
  iconBoxActive: {
    // Background set dynamically
  },
  bottom: {
    marginTop: 28,
    paddingBottom: 24,
  },
});
