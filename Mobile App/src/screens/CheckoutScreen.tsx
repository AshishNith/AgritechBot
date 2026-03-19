import { StyleSheet, View, TextInput, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText, Screen, GradientButton, ScreenCard } from '../components/ui';
import { theme } from '../constants/theme';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { PriceSummary } from '../components/marketplace/PriceSummary';
import { apiService } from '../api/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutScreen() {
  const navigation = useNavigation<Navigation>();
  const isDark = useColorScheme() === 'dark';
  const language = useAppStore((state) => state.language);
  const { cart, getCartTotal, clearCart, addOrder } = useMarketplaceStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const total = getCartTotal();
  const tax = total * 0.05;
  const shipping = 50;
  const finalTotal = total + tax + shipping;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!formData.name || !formData.phone || !formData.address) {
        throw new Error(t(language, 'fillRequiredFields'));
      }

      const response = await apiService.createOrder({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          line1: formData.address,
          line2: formData.city,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });

      return response;
    },
    onSuccess: (data) => {
      const orderId = data.order?.id || `ORD-${Date.now()}`;
      addOrder({
        id: orderId,
        items: cart,
        totalPrice: finalTotal,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        deliveryAddress: formData.address,
      });
      clearCart();
      navigation.navigate('OrderSuccess', { orderId });
    },
    onError: (error: any) => {
      Alert.alert(
        t(language, 'orderFailed'),
        error.message || t(language, 'orderFailedAuth')
      );
    },
  });

  return (
    <Screen scrollable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>
          <AppText variant="heading" style={{ flex: 1, textAlign: 'center' }}>
            {t(language, 'deliveryDetails')}
          </AppText>
          <View style={{ width: 24 }} />
        </View>

        {/* Delivery Information */}
        <ScreenCard style={{ marginTop: 16 }}>
          <AppText variant="label" style={{ marginBottom: 12 }}>
            {t(language, 'personalInfo')}
          </AppText>

          <TextInput
            placeholder={t(language, 'name')}
            placeholderTextColor={theme.colors.textMuted}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { marginBottom: 12 }]}
          />

          <TextInput
            placeholder={t(language, 'phone')}
            placeholderTextColor={theme.colors.textMuted}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { marginBottom: 12 }]}
          />

          <TextInput
            placeholder={t(language, 'email')}
            placeholderTextColor={theme.colors.textMuted}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { marginBottom: 12 }]}
          />
        </ScreenCard>

        {/* Address Information */}
        <ScreenCard style={{ marginTop: 12 }}>
          <AppText variant="label" style={{ marginBottom: 12 }}>
            {t(language, 'address')}
          </AppText>

          <TextInput
            placeholder={t(language, 'address')}
            placeholderTextColor={theme.colors.textMuted}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight, styles.textArea, { marginBottom: 12 }]}
          />

          <TextInput
            placeholder={t(language, 'city')}
            placeholderTextColor={theme.colors.textMuted}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { marginBottom: 12 }]}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              placeholder={t(language, 'state')}
              placeholderTextColor={theme.colors.textMuted}
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { flex: 1, marginBottom: 12 }]}
            />

            <TextInput
              placeholder={t(language, 'pincode')}
              placeholderTextColor={theme.colors.textMuted}
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { flex: 1, marginBottom: 12 }]}
            />
          </View>
        </ScreenCard>

        {/* Order Summary */}
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

        {/* Place Order Button */}
        <GradientButton
          label={createOrderMutation.isPending ? t(language, 'processing') : t(language, 'placeOrder')}
          onPress={() => createOrderMutation.mutate()}
          disabled={createOrderMutation.isPending}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDark: {
    backgroundColor: '#1b2721',
    borderColor: 'rgba(255,255,255,0.12)',
    color: theme.colors.textOnDark,
  },
  inputLight: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
});
