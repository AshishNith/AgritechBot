import { StyleSheet, View, useColorScheme } from 'react-native';
import { AppText } from '../ui';
import { theme } from '../../constants/theme';

interface PriceSummaryProps {
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  labels?: {
    subtotal?: string;
    tax?: string;
    shipping?: string;
    discount?: string;
    total?: string;
  };
}

export function PriceSummary({ subtotal, tax = 0, shipping = 0, discount = 0, total, labels }: PriceSummaryProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <AppText color={theme.colors.textMuted}>{labels?.subtotal ?? 'Subtotal'}</AppText>
        <AppText color={theme.colors.textMuted}>₹{subtotal.toFixed(0)}</AppText>
      </View>

      {tax > 0 && (
        <View style={styles.row}>
          <AppText color={theme.colors.textMuted}>{labels?.tax ?? 'Tax'} (5%)</AppText>
          <AppText color={theme.colors.textMuted}>₹{tax.toFixed(0)}</AppText>
        </View>
      )}

      {shipping > 0 && (
        <View style={styles.row}>
          <AppText color={theme.colors.textMuted}>{labels?.shipping ?? 'Shipping'}</AppText>
          <AppText color={theme.colors.textMuted}>₹{shipping.toFixed(0)}</AppText>
        </View>
      )}

      {discount > 0 && (
        <View style={styles.row}>
          <AppText color={theme.colors.success}>{labels?.discount ?? 'Discount'}</AppText>
          <AppText color={theme.colors.success}>-₹{discount.toFixed(0)}</AppText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : theme.colors.border }]} />

      <View style={styles.totalRow}>
        <AppText variant="label">{labels?.total ?? 'Total'}</AppText>
        <AppText variant="label" color={theme.colors.primary} style={styles.totalAmount}>
          ₹{total.toFixed(0)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 16,
  },
});
