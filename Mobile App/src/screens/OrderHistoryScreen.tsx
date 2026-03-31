import { StyleSheet, View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { IconMap } from '../components/IconMap';
import { AppText, Screen, ScreenCard, GradientButton } from '../components/ui';
import { localeForLanguage, t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';
import { apiService } from '../api/services';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: { [key: string]: string } = {
  pending: '#fbbf24',
  confirmed: '#60a5fa',
  shipped: '#34d399',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_ICONS: { [key: string]: string } = {
  pending: 'Clock',
  confirmed: 'CheckCircle2',
  shipped: 'Truck',
  delivered: 'CircleCheckBig',
  cancelled: 'XCircle',
};

export function OrderHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiService.getOrders(),
  });

  const orders = data?.orders ?? [];
  const statusLabels: { [key: string]: string } = {
    pending: t(language, 'statusPending'),
    confirmed: t(language, 'statusConfirmed'),
    shipped: t(language, 'statusShipped'),
    delivered: t(language, 'statusDelivered'),
    cancelled: t(language, 'orderFailed'),
  };

  const ShoppingCartIcon = IconMap['ShoppingCart'];
  const ArrowLeftIcon = IconMap['ArrowLeft'];

  if (isLoading) {
    return (
      <Screen scrollable>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText color={colors.textMuted} style={{ marginTop: 12 }}>
            {t(language, 'processing')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen scrollable>
        <View style={styles.emptyContainer}>
          <AppText variant="heading">{t(language, 'orderFailed')}</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
            {t(language, 'orderFailedAuth')}
          </AppText>
          <GradientButton label={t(language, 'retry')} onPress={() => refetch()} style={{ marginTop: 24 }} />
        </View>
      </Screen>
    );
  }

  if (orders.length === 0) {
    return (
      <Screen scrollable>
        <View style={styles.emptyContainer}>
          {ShoppingCartIcon ? <ShoppingCartIcon size={64} color={colors.textMuted} /> : null}
          <AppText variant="heading" style={{ marginTop: 16 }}>
            {t(language, 'noOrders')}
          </AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
            {t(language, 'noOrdersSubtitle')}
          </AppText>
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
          {t(language, 'orderHistory')}
        </AppText>
        <View style={{ width: 42 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => {
          const statusIconName = STATUS_ICONS[item.status] || 'Circle';
          const StatusIcon = IconMap[statusIconName];

          return (
            <ScreenCard style={styles.orderCard} key={item.id}>
              <View style={styles.orderHeader}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label">
                    {t(language, 'order')} #{item.id.slice(-6)}
                  </AppText>
                  <AppText color={colors.textMuted} style={{ fontSize: 12, marginTop: 4 }}>
                    {new Date(item.createdAt).toLocaleDateString(localeForLanguage(language))}
                  </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}30` }]}>
                  {StatusIcon ? (
                    <StatusIcon
                      size={14}
                      color={STATUS_COLORS[item.status]}
                      style={{ marginRight: 4 }}
                    />
                  ) : null}
                  <AppText color={STATUS_COLORS[item.status]} style={{ fontSize: 11, fontWeight: '600' }}>
                    {statusLabels[item.status]}
                  </AppText>
                </View>
              </View>

              <View style={[styles.itemsSummary, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceMuted }]}>
                {item.items.slice(0, 2).map((orderItem: { productId: string; name: string; quantity: number }) => (
                  <View key={`${orderItem.productId}-${orderItem.name}`} style={styles.itemRow}>
                    <AppText color={colors.textMuted} style={{ fontSize: 12 }}>
                      {orderItem.name}
                    </AppText>
                    <AppText color={colors.textMuted} style={{ fontSize: 12 }}>
                      x{orderItem.quantity}
                    </AppText>
                  </View>
                ))}
                {item.items.length > 2 ? (
                  <AppText color={colors.textMuted} style={{ fontSize: 11, marginTop: 4 }}>
                    +{item.items.length - 2} {t(language, 'moreItems')}
                  </AppText>
                ) : null}
              </View>

              <OrderTrackingTimeline 
                status={item.status} 
                shippingMethod={item.shippingMethod} 
              />

              <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                <View>
                  <AppText color={colors.textMuted} style={{ fontSize: 12 }}>
                    {t(language, 'total')}
                  </AppText>
                  <AppText variant="label" color={colors.primary}>
                    Rs {item.totalAmount.toFixed(0)}
                  </AppText>
                </View>
                <View>
                  <AppText color={colors.textMuted} style={{ fontSize: 12 }}>
                    {item.deliveryAddress.city}, {item.deliveryAddress.state}
                  </AppText>
                </View>
              </View>
            </ScreenCard>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={{ marginVertical: 12 }}
      />
    </Screen>
  );
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
  emptyContainer: {
    flex: 1,
    height: 500,
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
    padding: 10,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
