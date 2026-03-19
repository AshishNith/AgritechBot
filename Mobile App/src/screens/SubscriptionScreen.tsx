import { Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

const features = [
  ['Advanced AI', 'Deeper reasoning'],
  ['Personalized Advisory', 'Tailored suggestions'],
  ['Faster Responses', 'Priority processing'],
] as const;

export function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen scrollable>
      <Image source={{ uri: designImages.premiumHero }} style={styles.hero} />
      <AppText variant="caption" color={theme.colors.primaryDark} style={{ marginTop: 18 }}>
        Premium Plan
      </AppText>
      <AppText variant="display" style={{ marginTop: 10 }}>
        Unlock Full Potential
      </AppText>
      <AppText color={theme.colors.textMuted} style={{ marginTop: 10 }}>
        Experience advanced AI with multilingual guidance
      </AppText>
      <View style={{ gap: 12, marginTop: 22 }}>
        {features.map(([title, subtitle]) => (
          <ScreenCard key={title} style={styles.featureCard}>
            <View style={styles.featureIcon} />
            <View>
              <AppText variant="label">{title}</AppText>
              <AppText color={theme.colors.textMuted}>{subtitle}</AppText>
            </View>
          </ScreenCard>
        ))}
      </View>
      <ScreenCard style={[styles.pricingCard, styles.pricingCardActive]}>
        <AppText variant="label">Annual Plan</AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          ₹2,999/year
        </AppText>
        <AppText color={theme.colors.primaryDark}>SAVE 40%</AppText>
      </ScreenCard>
      <ScreenCard style={styles.pricingCard}>
        <AppText variant="label">Monthly Plan</AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          ₹399/month
        </AppText>
      </ScreenCard>
      <GradientButton label="Start 7-Day Free Trial" onPress={() => navigation.goBack()} style={{ marginTop: 18 }} />
      <AppText color={theme.colors.textMuted} style={{ textAlign: 'center', marginTop: 12, paddingBottom: 120 }}>
        Cancel anytime. No commitment.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    marginTop: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(82,183,129,0.14)',
  },
  pricingCard: {
    marginTop: 16,
  },
  pricingCardActive: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
});
