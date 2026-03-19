import { StyleSheet, View, FlatList, Pressable, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText, Screen, ScreenCard } from '../components/ui';
import { localeForLanguage, t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const STATUS_COLORS: { [key: string]: string } = {
  pending: '#fbbf24',
  confirmed: '#60a5fa',
  shipped: '#34d399',
  delivered: '#10b981',
};

export function OrderHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const isDark = useColorScheme() === 'dark';
  const language = useAppStore((state) => state.language);
  const { orders } = useMarketplaceStore();

  const statusLabels: { [key: string]: string } = {
    pending: t(language, 'statusPending'),
    confirmed: t(language, 'statusConfirmed'),
    shipped: t(language, 'statusShipped'),
    delivered: t(language, 'statusDelivered'),
  };

  if (orders.length === 0) {
    return (
      <Screen scrollable>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="cart"
            size={64}
            color={theme.colors.textMuted}
          />
          <AppText variant="heading" style={{ marginTop: 16 }}>
            {t(language, 'noOrders')}
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
            {t(language, 'noOrdersSubtitle')}
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <AppText variant="heading" style={{ flex: 1, textAlign: 'center' }}>
          {t(language, 'orderHistory')}
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <ScreenCard style={styles.orderCard} key={item.id}>
            <View style={styles.orderHeader}>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{t(language, 'order')} #{item.id.slice(-6)}</AppText>
                <AppText color={theme.colors.textMuted} style={{ fontSize: 12, marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleDateString(localeForLanguage(language))}
                </AppText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${STATUS_COLORS[item.status]}30` },
                ]}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(item.status)}
                  size={14}
                  color={STATUS_COLORS[item.status]}
                  style={{ marginRight: 4 }}
                />
                <AppText
                  color={STATUS_COLORS[item.status]}
                  style={{ fontSize: 11, fontWeight: '600' }}
                >
                  {statusLabels[item.status]}
                </AppText>
              </View>
            </View>

            {/* Items Summary */}
            <View style={[styles.itemsSummary, { backgroundColor: isDark ? '#1b2721' : theme.colors.surfaceMuted }]}>
              {item.items.slice(0, 2).map((cartItem) => (
                <View key={cartItem.product.id} style={styles.itemRow}>
                  <AppText color={theme.colors.textMuted} style={{ fontSize: 12 }}>
                    {cartItem.product.name}
                  </AppText>
                  <AppText color={theme.colors.textMuted} style={{ fontSize: 12 }}>
                    x{cartItem.quantity}
                  </AppText>
                </View>
              ))}
              {item.items.length > 2 && (
                <AppText color={theme.colors.textMuted} style={{ fontSize: 11, marginTop: 4 }}>
                  +{item.items.length - 2} {t(language, 'moreItems')}
                </AppText>
              )}
            </View>

            {/* Total and Action */}
            <View style={styles.orderFooter}>
              <View>
                <AppText color={theme.colors.textMuted} style={{ fontSize: 12 }}>
                  {t(language, 'total')}
                </AppText>
                <AppText variant="label" color={theme.colors.primary}>
                  ₹{item.totalPrice.toFixed(0)}
                </AppText>
              </View>
              <Pressable style={styles.viewButton}>
                <AppText color={theme.colors.primary} style={{ fontSize: 12 }}>
                  {t(language, 'viewDetails')}
                </AppText>
              </Pressable>
            </View>
          </ScreenCard>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={{ marginVertical: 12 }}
      />
    </Screen>
  );
}

function getStatusIcon(status: string): IconName {
  switch (status) {
    case 'pending':
      return 'clock-outline';
    case 'confirmed':
      return 'check-circle-outline';
    case 'shipped':
      return 'truck-outline';
    case 'delivered':
      return 'check-circle';
    default:
      return 'cart';
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsSummary: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 6,
  },
});
