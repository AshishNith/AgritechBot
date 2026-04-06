import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, GradientButton, GlassCard } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { t } from '../constants/localization';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface PaywallBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  type?: 'scan' | 'chat';
}

export function PaywallBottomSheet({ visible, onClose, type = 'scan' }: PaywallBottomSheetProps) {
  const { colors, isDark } = useTheme();
  const language = useAppStore((state) => state.language);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!visible) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'I am using AgritechBot to grow my crops better! Check it out: https://agritechbot.com',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            {/* Grabber */}
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  {(() => {
                    const IconComp = type === 'scan' ? IconMap['Scan'] : IconMap['MessageSquare'];
                    return IconComp ? <IconComp size={32} color={colors.primary} /> : null;
                  })()}
                </View>
                <AppText variant="heading" style={styles.title}>
                  {type === 'scan' ? 'Scan Limit Reached' : 'Chat Limit Reached'}
                </AppText>
                <AppText color={colors.textMuted} style={styles.subtitle}>
                  Upgrade to continue using our premium AI features or earn credits by referring friends.
                </AppText>
              </View>

              {/* Main Action Card */}
              <GlassCard style={styles.planCard}>
                <LinearGradient
                  colors={[colors.primary + '20', 'transparent']}
                  style={styles.gradient}
                />
                <View style={styles.planHeader}>
                  <View>
                    <AppText variant="label" color={colors.primary}>RECOMMENDED</AppText>
                    <AppText variant="heading" style={{ fontSize: 24 }}>Premium Plan</AppText>
                  </View>
                  <View style={styles.badge}>
                    <AppText variant="caption" color="#fff" style={{ fontWeight: 'bold' }}>-40% OFF</AppText>
                  </View>
                </View>
                
                <View style={styles.features}>
                  <FeatureItem text="Unlimited AI Crop Scans" active />
                  <FeatureItem text="24/7 Expert AI Consultation" active />
                  <FeatureItem text="Advanced Pest Recognition" active />
                </View>

                <GradientButton
                  label="Unlock Unlimited Access"
                  onPress={() => {
                    onClose();
                    navigation.navigate('Subscription', { tab: 'plans' });
                  }}
                  style={{ marginTop: 20 }}
                />
              </GlassCard>

              {/* Alternative Actions */}
              <View style={styles.altActions}>
                <AppText variant="label" style={styles.altTitle}>Other Options</AppText>
                
                <Pressable
                  onPress={handleShare}
                  style={[styles.tile, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                >
                  <View style={[styles.tileIcon, { backgroundColor: '#F59E0B20' }]}>
                    {(() => {
                      const IconComp = IconMap['Share2'];
                      return IconComp ? <IconComp size={20} color="#F59E0B" /> : null;
                    })()}
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" style={{ fontSize: 16 }}>Refer a Friend</AppText>
                    <AppText variant="caption" color={colors.textMuted}>Get 5 free credits for every invite</AppText>
                  </View>
                  {(() => {
                      const IconComp = IconMap['ChevronRight'];
                      return IconComp ? <IconComp size={20} color={colors.textMuted} /> : null;
                    })()}
                </Pressable>

                <Pressable
                  onPress={() => {
                    onClose();
                    navigation.navigate('Subscription', { tab: 'topup' });
                  }}
                  style={[styles.tile, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                >
                  <View style={[styles.tileIcon, { backgroundColor: colors.primary + '20' }]}>
                    {(() => {
                      const IconComp = IconMap['Coins'];
                      return IconComp ? <IconComp size={20} color={colors.primary} /> : null;
                    })()}
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" style={{ fontSize: 16 }}>One-time Topup</AppText>
                    <AppText variant="caption" color={colors.textMuted}>Add credits starting at ₹99</AppText>
                  </View>
                  {(() => {
                      const IconComp = IconMap['ChevronRight'];
                      return IconComp ? <IconComp size={20} color={colors.textMuted} /> : null;
                    })()}
                </Pressable>
              </View>

              <Pressable onPress={onClose} style={styles.closeBtn}>
                <AppText variant="caption" color={colors.textMuted}>{t(language, 'later')}</AppText>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FeatureItem({ text, active }: { text: string; active?: boolean }) {
  const { colors } = useTheme();
  const IconComp = IconMap['CheckCircled'] || IconMap['Check'];
  return (
    <View style={styles.featureItem}>
      <View style={[styles.check, { backgroundColor: active ? colors.primary + '30' : 'rgba(0,0,0,0.05)' }]}>
        {IconComp && <IconComp size={14} color={active ? colors.primary : '#94A3B8'} />}
      </View>
      <AppText style={{ fontSize: 14 }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
    maxHeight: '90%',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    opacity: 0.5,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  planCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    marginBottom: 24,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altActions: {
    gap: 12,
  },
  altTitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
});
