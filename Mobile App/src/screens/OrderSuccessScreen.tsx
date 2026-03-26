import { StyleSheet, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconMap } from '../components/IconMap';

import { AppText, Screen, GradientButton } from '../components/ui';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const { orderId } = route.params;

  const handleContinueShopping = () => {
    navigation.navigate('Marketplace');
  };

  const handleViewOrders = () => {
    navigation.navigate('OrderHistory');
  };

  const CheckIcon = IconMap['CircleCheckBig'];
  const TruckIcon = IconMap['Truck'];

  return (
    <Screen scrollable padded>
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          {CheckIcon ? <CheckIcon size={80} color={colors.primary} /> : null}
        </View>

        {/* Success Message */}
        <AppText variant="heading" style={styles.title}>
          {t(language, 'orderSuccess')}
        </AppText>

        <AppText color={colors.textMuted} style={styles.subtitle}>
          {t(language, 'orderSuccessSubtitle')}
        </AppText>

        {/* Order ID */}
        <View style={[styles.orderIdContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface, borderColor: colors.border }]}>
          <AppText color={colors.textMuted} style={{ fontSize: 12 }}>
            {t(language, 'orderId')}
          </AppText>
          <AppText variant="label" style={{ marginTop: 8 }}>
            {orderId}
          </AppText>
        </View>

        {/* Information Box */}
        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(82,183,129,0.15)' : 'rgba(82,183,129,0.08)', borderColor: 'rgba(82,183,129,0.2)' }]}>
          {TruckIcon ? (
            <TruckIcon size={24} color={colors.primary} style={{ marginBottom: 8 }} />
          ) : null}
          <AppText variant="label" style={{ marginBottom: 4 }}>
            {t(language, 'deliveryInfo')}
          </AppText>
          <AppText color={colors.textMuted} style={{ fontSize: 12, textAlign: 'center' }}>
            {t(language, 'deliveryInfoSubtitle')}
          </AppText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <GradientButton
            label={t(language, 'viewOrderHistory')}
            onPress={handleViewOrders}
          />

          <Pressable
            onPress={handleContinueShopping}
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
          >
            <AppText color={colors.primary} style={{ textAlign: 'center', fontWeight: '600' }}>
              {t(language, 'continueShopping')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  orderIdContainer: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  infoBox: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
});
