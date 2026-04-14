import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui';
import { useTheme } from '../../providers/ThemeContext';

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
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <AppText color={colors.textMuted}>{labels?.subtotal ?? 'Subtotal'}</AppText>
        <AppText color={colors.textMuted}>₹{subtotal.toFixed(0)}</AppText>
      </View>

      {tax > 0 && (
        <View style={styles.row}>
          <AppText color={colors.textMuted}>{labels?.tax ?? 'Tax'} (5%)</AppText>
          <AppText color={colors.textMuted}>₹{tax.toFixed(0)}</AppText>
        </View>
      )}

      {shipping > 0 && (
        <View style={styles.row}>
          <AppText color={colors.textMuted}>{labels?.shipping ?? 'Shipping'}</AppText>
          <AppText color={colors.textMuted}>₹{shipping.toFixed(0)}</AppText>
        </View>
      )}

      {discount > 0 && (
        <View style={styles.row}>
          <AppText color={colors.success}>{labels?.discount ?? 'Discount'}</AppText>
          <AppText color={colors.success}>-₹{discount.toFixed(0)}</AppText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.totalRow}>
        <AppText variant="label">{labels?.total ?? 'Total'}</AppText>
        <AppText variant="label" color={colors.primary} style={styles.totalAmount}>
          ₹{total.toFixed(0)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
