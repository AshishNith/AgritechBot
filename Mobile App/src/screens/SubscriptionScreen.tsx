import { Alert, Image, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../navigation/types';

const features = [
  ['Advanced AI', 'Deeper reasoning'],
  ['Personalized Advisory', 'Tailored suggestions'],
  ['Faster Responses', 'Priority processing'],
] as const;

export function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('premium');

  const subscribeMutation = useMutation({
    mutationFn: () => apiService.subscribe(selectedPlan, `mock_pay_${Date.now()}`),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, subscriptionTier: selectedPlan });
      }
      Alert.alert('Success!', data.message || `You are now subscribed to the ${selectedPlan} plan. Enjoy!`);
      navigation.goBack();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to process subscription. Please try again.';
      Alert.alert('Payment Error', msg);
    },
  });

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
      
      <Pressable onPress={() => setSelectedPlan('premium')}>
        <ScreenCard style={[styles.pricingCard, selectedPlan === 'premium' && styles.pricingCardActive]}>
          <AppText variant="label">Annual Plan (Premium)</AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            ₹2,999/year
          </AppText>
          {selectedPlan === 'premium' && <AppText color={theme.colors.primaryDark}>SAVE 40%</AppText>}
        </ScreenCard>
      </Pressable>

      <Pressable onPress={() => setSelectedPlan('basic')}>
        <ScreenCard style={[styles.pricingCard, selectedPlan === 'basic' && styles.pricingCardActive]}>
          <AppText variant="label">Monthly Plan (Basic)</AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            ₹399/month
          </AppText>
        </ScreenCard>
      </Pressable>

      <GradientButton 
        label={subscribeMutation.isPending ? 'Processing...' : 'Start 7-Day Free Trial'} 
        onPress={() => subscribeMutation.mutate()} 
        disabled={subscribeMutation.isPending}
        style={{ marginTop: 18 }} 
        leftIcon={subscribeMutation.isPending ? <ActivityIndicator size={18} color={theme.colors.textOnDark} /> : undefined}
      />
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
