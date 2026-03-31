import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { t } from '../constants/localization';
import { useAppStore } from '../store/useAppStore';

interface OrderTrackingTimelineProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingMethod?: 'delivery' | 'pickup';
}

const STEPS = [
  { key: 'pending', icon: 'Clock', label: 'Order Placed' },
  { key: 'confirmed', icon: 'CheckCircle2', label: 'Confirmed' },
  { key: 'shipped', icon: 'Truck', label: 'In Transit' },
  { key: 'delivered', icon: 'CircleCheckBig', label: 'Delivered' },
];

const PICKUP_STEPS = [
  { key: 'pending', icon: 'Clock', label: 'Order Placed' },
  { key: 'confirmed', icon: 'CheckCircle2', label: 'Confirmed' },
  { key: 'ready', icon: 'PackageOpen', label: 'Ready for Pickup' },
  { key: 'delivered', icon: 'CircleCheckBig', label: 'Picked Up' },
];

export function OrderTrackingTimeline({ status, shippingMethod }: OrderTrackingTimelineProps) {
  const { colors } = useTheme();
  const language = useAppStore((state) => state.language);
  
  const steps = shippingMethod === 'pickup' ? PICKUP_STEPS : STEPS;
  
  // Mapping API status to step index
  const getStatusIndex = (currentStatus: string) => {
    if (currentStatus === 'cancelled') return -1;
    if (currentStatus === 'pending') return 0;
    if (currentStatus === 'confirmed') return 1;
    if (currentStatus === 'shipped') return 2;
    if (currentStatus === 'delivered') return 3;
    return 0;
  };

  const currentIndex = getStatusIndex(status);

  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledBox}>
        {(() => { const XCircle = IconMap['XCircle']; return XCircle ? <XCircle size={16} color={colors.danger} /> : null; })()}
        <AppText color={colors.danger} variant="caption" style={{ fontWeight: '600' }}>
          This order was cancelled
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;
        const IconComp = IconMap[step.icon];

        return (
          <View key={step.key} style={[styles.stepContainer, { flex: isLast ? 0 : 1 }]}>
            <View style={styles.iconWrapper}>
              <View 
                style={[
                  styles.dot, 
                  { 
                    backgroundColor: isCompleted ? colors.primary : colors.border,
                    transform: [{ scale: isCurrent ? 1.4 : 1 }]
                  }
                ]} 
              />
              {!isLast && (
                <View 
                  style={[
                    styles.line, 
                    { backgroundColor: index < currentIndex ? colors.primary : colors.border }
                  ]} 
                />
              )}
            </View>
            <View style={styles.labelWrapper}>
              <AppText 
                variant="caption" 
                color={isCurrent ? colors.primary : isCompleted ? colors.text : colors.textMuted}
                style={{ fontSize: 10, fontWeight: isCurrent ? '700' : '400', textAlign: 'center' }}
              >
                {t(language, step.key as any) || step.label}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    marginTop: 8,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  line: {
    position: 'absolute',
    left: '50%',
    top: 10,
    width: '100%',
    height: 2,
    zIndex: 1,
  },
  labelWrapper: {
    marginTop: 8,
    width: 60,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.05)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
});
