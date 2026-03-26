import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconMap } from '../components/IconMap';

import { AppText, Screen, GradientButton } from '../components/ui';
import { theme } from '../constants/theme';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = useColorScheme() === 'dark';
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
          {CheckIcon ? <CheckIcon size={80} color={theme.colors.primary} /> : null}
        </View>

        {/* Success Message */}
        <AppText variant="heading" style={styles.title}>
          {t(language, 'orderSuccess')}
        </AppText>

        <AppText color={theme.colors.textMuted} style={styles.subtitle}>
          {t(language, 'orderSuccessSubtitle')}
        </AppText>

        {/* Order ID */}
        <View style={[styles.orderIdContainer, isDark ? styles.orderIdContainerDark : styles.orderIdContainerLight]}>
          <AppText color={theme.colors.textMuted} style={{ fontSize: 12 }}>
            {t(language, 'orderId')}
          </AppText>
          <AppText variant="label" style={{ marginTop: 8 }}>
            {orderId}
          </AppText>
        </View>

        {/* Information Box */}
        <View style={styles.infoBox}>
          {TruckIcon ? (
            <TruckIcon size={24} color={theme.colors.primary} style={{ marginBottom: 8 }} />
          ) : null}
          <AppText variant="label" style={{ marginBottom: 4 }}>
            {t(language, 'deliveryInfo')}
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ fontSize: 12, textAlign: 'center' }}>
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
            style={styles.secondaryButton}
          >
            <AppText color={theme.colors.primary} style={{ textAlign: 'center' }}>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    width: '100%',
  },
  orderIdContainerDark: {
    backgroundColor: '#1b2721',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  orderIdContainerLight: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  infoBox: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
});
