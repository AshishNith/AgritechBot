import { StyleSheet, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText, Screen, GradientButton } from '../components/ui';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { CartItem } from '../components/marketplace/CartItem';
import { PriceSummary } from '../components/marketplace/PriceSummary';
import { IconMap } from '../components/IconMap';
import { useTheme } from '../providers/ThemeContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Navigation>();
  const language = useAppStore((state) => state.language);
  const { cart, removeFromCart, updateCartItemQuantity, getCartTotal } = useMarketplaceStore();

  const total = getCartTotal();
  const tax = total * 0.05;
  const subtotal = total;

  const ShoppingCartIcon = IconMap['ShoppingCart'];
  const ArrowLeftIcon = IconMap['ArrowLeft'];

  if (cart.length === 0) {
    return (
      <Screen scrollable>
        <View style={styles.emptyContainer}>
          {ShoppingCartIcon ? (
            <ShoppingCartIcon size={64} color={colors.textMuted} />
          ) : null}
          <AppText variant="heading" style={{ marginTop: 16 }}>
            {t(language, 'cartEmptyTitle')}
          </AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
            {t(language, 'cartEmptySubtitle')}
          </AppText>
          <GradientButton
            label={t(language, 'startShopping')}
            onPress={() => navigation.navigate('Marketplace')}
            style={{ marginTop: 24 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceMuted }]}>
          {ArrowLeftIcon ? <ArrowLeftIcon size={22} color={colors.text} /> : null}
        </Pressable>
        <AppText variant="heading" style={{ flex: 1, textAlign: 'center' }}>
          {t(language, 'cart')}
        </AppText>
        <View style={{ width: 42 }} />
      </View>

      <View style={{ marginVertical: 16 }}>
        {cart.map((item) => (
          <CartItem
            key={item.product.id}
            item={item}
            onQuantityChange={(quantity) => {
              if (quantity === 0) {
                removeFromCart(item.product.id);
              } else {
                updateCartItemQuantity(item.product.id, quantity);
              }
            }}
            onRemove={() => removeFromCart(item.product.id)}
          />
        ))}
      </View>

      <View style={styles.summarySection}>
        <PriceSummary
          subtotal={subtotal}
          tax={tax}
          total={subtotal + tax}
          labels={{
            subtotal: t(language, 'subtotal'),
            tax: t(language, 'tax'),
            discount: t(language, 'discount'),
            shipping: t(language, 'shipping'),
            total: t(language, 'total'),
          }}
        />

        <GradientButton
          label={t(language, 'checkout')}
          onPress={() => navigation.navigate('Checkout')}
          style={{ marginTop: 16 }}
        />

        <Pressable
          onPress={() => navigation.navigate('Marketplace')}
          style={styles.continueShopping}
        >
          <AppText color={colors.primary} style={{ textAlign: 'center' }}>
            {t(language, 'continueShopping')}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
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
  summarySection: {
    marginTop: 20,
    paddingBottom: 200,
  },
  continueShopping: {
    marginTop: 12,
    paddingVertical: 12,
  },
});
