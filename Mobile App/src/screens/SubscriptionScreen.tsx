import { Alert, Image, Linking, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { designImages } from '../constants/designData';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';

const features = [
  ['AI Crop Doctor', '5 or 10 professional scans/mo'],
  ['Krishi AI Chat', '35 or 55 smart messages/mo'],
  ['Voice Assistance', 'Full voice-to-voice support'],
  ['Priority Support', 'Expert help on priority'],
] as const;

export function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('premium');
  const [pendingPayment, setPendingPayment] = useState<{
    paymentOrderId: string;
    checkoutToken: string;
    checkoutUrl: string;
  } | null>(null);

  const createPaymentMutation = useMutation({
    mutationFn: () => apiService.createSubscriptionPayment(selectedPlan),
    onSuccess: async (data) => {
      setPendingPayment({
        paymentOrderId: data.paymentOrderId,
        checkoutToken: data.checkoutToken,
        checkoutUrl: data.checkoutUrl,
      });

      const supported = await Linking.canOpenURL(data.checkoutUrl);
      if (!supported) {
        Alert.alert('Checkout unavailable', 'Unable to open the secure subscription checkout page on this device.');
        return;
      }

      await Linking.openURL(data.checkoutUrl);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to start subscription checkout. Please try again.';
      Alert.alert('Subscription Error', msg);
    },
  });

  const refreshPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!pendingPayment) {
        throw new Error('No pending subscription payment found');
      }

      return apiService.getPaymentStatus(pendingPayment.paymentOrderId, pendingPayment.checkoutToken);
    },
    onSuccess: (data) => {
      if (data.status === 'verified' && data.subscriptionTier) {
        if (user) {
          setUser({ ...user, subscriptionTier: data.subscriptionTier });
        }
        Alert.alert('Subscription active', `Your ${data.subscriptionTier} plan is now active.`);
        navigation.goBack();
        return;
      }

      if (data.status === 'failed') {
        Alert.alert('Payment failed', data.error || 'The subscription payment could not be verified.');
        return;
      }

      Alert.alert('Payment pending', 'Complete the payment in your browser, then tap refresh again.');
    },
    onError: (error: any) => {
      Alert.alert('Refresh failed', error.message || 'Unable to refresh subscription status.');
    },
  });

  return (
    <Screen scrollable>
      <Image source={{ uri: designImages.premiumHero }} style={styles.hero} />
      <AppText variant="caption" color={colors.primaryDark} style={{ marginTop: 18 }}>
        Premium Plan
      </AppText>
      <AppText variant="display" style={{ marginTop: 10 }}>
        Unlock Full Potential
      </AppText>
      <AppText color={colors.textMuted} style={{ marginTop: 10 }}>
        Experience advanced AI with multilingual guidance
      </AppText>

      <View style={{ gap: 12, marginTop: 22 }}>
        {features.map(([title, subtitle]) => (
          <ScreenCard key={title} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(82,183,129,0.2)' : 'rgba(82,183,129,0.14)' }]} />
            <View>
              <AppText variant="label">{title}</AppText>
              <AppText color={colors.textMuted}>{subtitle}</AppText>
            </View>
          </ScreenCard>
        ))}
      </View>

      <Pressable onPress={() => setSelectedPlan('premium')}>
        <ScreenCard style={[styles.pricingCard, selectedPlan === 'premium' && [styles.pricingCardActive, { borderColor: colors.primary, shadowColor: colors.primary }]]}>
          <AppText variant="label">Premium Plan</AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            ₹199 / month
          </AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 4 }}>
            55 Chats + 10 Image Scans
          </AppText>
        </ScreenCard>
      </Pressable>

      <Pressable onPress={() => setSelectedPlan('basic')}>
        <ScreenCard style={[styles.pricingCard, selectedPlan === 'basic' && [styles.pricingCardActive, { borderColor: colors.primary, shadowColor: colors.primary }]]}>
          <AppText variant="label">Basic Plan</AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            ₹149 / month
          </AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 4 }}>
            35 Chats + 5 Image Scans
          </AppText>
        </ScreenCard>
      </Pressable>

      {pendingPayment ? (
        <ScreenCard style={{ marginTop: 18 }}>
          <AppText variant="label">Secure subscription checkout is ready</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 8 }}>
            Finish the payment in your browser, then return here and refresh the status.
          </AppText>
          <View style={{ gap: 12, marginTop: 16 }}>
            <GradientButton
              label="Reopen Secure Checkout"
              onPress={() => Linking.openURL(pendingPayment.checkoutUrl)}
            />
            <GradientButton
              label={refreshPaymentMutation.isPending ? 'Checking payment...' : 'I Completed Payment'}
              secondary
              onPress={() => refreshPaymentMutation.mutate()}
              disabled={refreshPaymentMutation.isPending}
            />
          </View>
        </ScreenCard>
      ) : null}

      <GradientButton
        label={createPaymentMutation.isPending ? 'Opening secure checkout...' : 'Continue to Secure Payment'}
        onPress={() => createPaymentMutation.mutate()}
        disabled={createPaymentMutation.isPending}
        style={{ marginTop: 24 }}
        leftIcon={
          createPaymentMutation.isPending ? (
            <ActivityIndicator size={18} color={colors.textOnDark} />
          ) : undefined
        }
      />
      <AppText color={colors.textMuted} style={{ textAlign: 'center', marginTop: 12, paddingBottom: 120 }}>
        Plans activate only after payment verification.
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
  },
  pricingCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pricingCardActive: {
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
