import { StyleSheet, View, TextInput, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { IconMap } from '../components/IconMap';
import { AppText, Screen, GradientButton, ScreenCard } from '../components/ui';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { PriceSummary } from '../components/marketplace/PriceSummary';
import { apiService } from '../api/services';
import { useTheme } from '../providers/ThemeContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutScreen() {
  const navigation = useNavigation<Navigation>();
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const user = useAppStore((state) => state.user);
  const { cart, getCartTotal, clearCart } = useMarketplaceStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: '',
    address: user?.location?.address || '',
    city: user?.location?.district || '',
    state: user?.location?.state || '',
    pincode: '',
  });
  const [pendingPayment, setPendingPayment] = useState<{
    paymentOrderId: string;
    checkoutToken: string;
    checkoutUrl: string;
  } | null>(null);

  const total = getCartTotal();
  const tax = total * 0.05;
  const shipping = 50;
  const finalTotal = total + tax + shipping;

  const validationError = useMemo(() => {
    if (!formData.name.trim()) return t(language, 'nameCannotBeEmpty');
    if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) return t(language, 'invalidPhone');
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      return t(language, 'fillRequiredFields');
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) return t(language, 'fillRequiredFields');
    if (!cart.length) return t(language, 'cartEmptySubtitle');
    return null;
  }, [cart.length, formData.address, formData.city, formData.name, formData.phone, formData.pincode, formData.state, language]);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (validationError) {
        throw new Error(validationError);
      }

      return apiService.createOrderPayment({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          line1: formData.address,
          line2: formData.email || undefined,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });
    },
    onSuccess: async (data) => {
      setPendingPayment({
        paymentOrderId: data.paymentOrderId,
        checkoutToken: data.checkoutToken,
        checkoutUrl: data.checkoutUrl,
      });

      const supported = await Linking.canOpenURL(data.checkoutUrl);
      if (!supported) {
        Alert.alert('Checkout unavailable', 'Unable to open the secure checkout page on this device.');
        return;
      }

      await Linking.openURL(data.checkoutUrl);
    },
    onError: (error: any) => {
      Alert.alert(t(language, 'orderFailed'), error.message || t(language, 'orderFailedAuth'));
    },
  });

  const refreshPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!pendingPayment) {
        throw new Error('No pending payment found');
      }

      return apiService.getPaymentStatus(pendingPayment.paymentOrderId, pendingPayment.checkoutToken);
    },
    onSuccess: (data) => {
      if (data.status === 'verified' && data.orderId) {
        clearCart();
        navigation.replace('OrderSuccess', { orderId: data.orderId });
        return;
      }

      if (data.status === 'failed') {
        Alert.alert('Payment failed', data.error || 'The payment could not be verified.');
        return;
      }

      Alert.alert('Payment pending', 'We have not received payment confirmation yet. Complete checkout in the browser, then tap refresh again.');
    },
    onError: (error: any) => {
      Alert.alert('Payment check failed', error.message || 'Unable to check payment status right now.');
    },
  });

  const ArrowLeftIcon = IconMap['ArrowLeft'];

  return (
    <Screen scrollable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceMuted }]}>
            {ArrowLeftIcon ? <ArrowLeftIcon size={22} color={colors.text} /> : null}
          </Pressable>
          <AppText variant="heading" style={{ flex: 1, textAlign: 'center' }}>
            {t(language, 'deliveryDetails')}
          </AppText>
          <View style={{ width: 42 }} />
        </View>

        <ScreenCard style={{ marginTop: 16 }}>
          <AppText variant="label" style={{ marginBottom: 12 }}>
            {t(language, 'personalInfo')}
          </AppText>

          <TextInput
            placeholder={t(language, 'name')}
            placeholderTextColor={colors.textMuted}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={[styles.input, inputStyle(isDark, colors), { marginBottom: 16 }]}
          />

          <TextInput
            placeholder={t(language, 'phone')}
            placeholderTextColor={colors.textMuted}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            style={[styles.input, inputStyle(isDark, colors), { marginBottom: 16 }]}
          />

          <TextInput
            placeholder={t(language, 'email')}
            placeholderTextColor={colors.textMuted}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, inputStyle(isDark, colors)]}
          />
        </ScreenCard>

        <ScreenCard style={{ marginTop: 12 }}>
          <AppText variant="label" style={{ marginBottom: 12 }}>
            {t(language, 'address')}
          </AppText>

          <TextInput
            placeholder={t(language, 'address')}
            placeholderTextColor={colors.textMuted}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
            style={[styles.input, inputStyle(isDark, colors), styles.textArea, { marginBottom: 16 }]}
          />

          <TextInput
            placeholder={t(language, 'city')}
            placeholderTextColor={colors.textMuted}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            style={[styles.input, inputStyle(isDark, colors), { marginBottom: 16 }]}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              placeholder={t(language, 'state')}
              placeholderTextColor={colors.textMuted}
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              style={[styles.input, inputStyle(isDark, colors), { flex: 1, marginBottom: 16 }]}
            />

            <TextInput
              placeholder={t(language, 'pincode')}
              placeholderTextColor={colors.textMuted}
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, inputStyle(isDark, colors), { flex: 1, marginBottom: 16 }]}
            />
          </View>
        </ScreenCard>

        {validationError ? (
          <View style={styles.inlineError}>
            <AppText color={colors.danger}>{validationError}</AppText>
          </View>
        ) : null}

        {pendingPayment ? (
          <ScreenCard style={{ marginTop: 16 }}>
            <AppText variant="label">Secure payment session created</AppText>
            <AppText color={colors.textMuted} style={{ marginTop: 8 }}>
              Complete the payment in your browser, then return here and refresh the payment status.
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

        <View style={{ marginTop: 16 }}>
          <AppText variant="label" style={{ marginBottom: 12 }}>
            {t(language, 'orderSummary')}
          </AppText>
          <PriceSummary
            subtotal={total}
            tax={tax}
            shipping={shipping}
            total={finalTotal}
            labels={{
              subtotal: t(language, 'subtotal'),
              tax: t(language, 'tax'),
              shipping: t(language, 'shipping'),
              discount: t(language, 'discount'),
              total: t(language, 'total'),
            }}
          />
        </View>

        <GradientButton
          label={createPaymentMutation.isPending ? 'Opening secure checkout...' : 'Pay Securely'}
          onPress={() => createPaymentMutation.mutate()}
          disabled={createPaymentMutation.isPending || !!validationError}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </Screen>
  );
}

function inputStyle(
  isDark: boolean,
  colors: { border: string; text: string; surfaceMuted: string }
) {
  return {
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted,
  };
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inlineError: {
    marginTop: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
});
