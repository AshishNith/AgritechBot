import React, { useState, useEffect } from 'react';
import { Alert, Image, Pressable, StyleSheet, View, ActivityIndicator, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, GlassCard, ProgressBar, Pill } from '../components/ui';
import { designImages } from '../constants/designData';
import { useAppStore } from '../store/useAppStore';
import { useWallet } from '../hooks/useWallet';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { IconMap } from '../components/IconMap';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const features = [
  { title: 'AI Crop Doctor', subtitle: 'Identify diseases from photos instantly', icon: 'Scan' },
  { title: 'Krishi Assistant', subtitle: 'Unlimited specialized farming chat', icon: 'MessageSquare' },
  { title: 'Multi-lingual', subtitle: 'Support for 10+ local Indian languages', icon: 'Languages' },
  { title: 'Expert Priority', subtitle: 'Get answers up to 3x faster', icon: 'Zap' },
] as const;

export function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const { refetchWallet } = useWallet();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const subscriptionStatus = useAppStore((state) => state.subscriptionStatus);
  const setSubscriptionStatus = useAppStore((state) => state.setSubscriptionStatus);

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('pro');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const subStatusQuery = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => apiService.getSubscriptionStatus(),
    gcTime: 0,
  });

  useEffect(() => {
    if (subStatusQuery.data) {
      setSubscriptionStatus(subStatusQuery.data);
    }
  }, [subStatusQuery.data, setSubscriptionStatus]);

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const order = await apiService.createSubscriptionOrder(selectedPlan);
      const razorpayPaymentId = `pay_mock_${Date.now()}`;
      const razorpaySignature = `mock_signature_${order.orderId}_${razorpayPaymentId}`;

      return apiService.verifyWalletPayment({
        razorpayOrderId: order.orderId,
        razorpayPaymentId,
        razorpaySignature,
        purpose: 'subscription',
        tier: selectedPlan,
      });
    },
    onSuccess: () => {
      setPaymentStatus('processing');
      setTimeout(() => {
        setPaymentStatus('success');
        void Promise.all([subStatusQuery.refetch(), refetchWallet()]);
        setTimeout(() => {
          setShowPaymentModal(false);
          Alert.alert('Payment Successful', `Welcome to Anaaj ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}!`);
          navigation.goBack();
        }, 1500);
      }, 2000);
    },
    onError: () => {
      setShowPaymentModal(false);
      setPaymentStatus('idle');
      Alert.alert('Payment Error', 'Payment failed. Please try again.');
    },
  });

  const handlePayment = () => {
    setShowPaymentModal(true);
    setPaymentStatus('idle');
    processPaymentMutation.mutate();
  };

  const currentTier = subscriptionStatus?.tier || 'free';

  return (
    <Screen scrollable padded={false}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
           {(() => { const Icon = IconMap['ArrowLeft']; return Icon ? <Icon size={24} color={colors.text} /> : null; })()}
        </Pressable>
        <AppText variant="title">Subscription</AppText>
        <View style={{ width: 44 }} />
      </View>

      <Image source={{ uri: designImages.premiumHero }} style={styles.hero} />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <AppText variant="display" style={styles.title}>
            Master Your Harvest
          </AppText>
          <AppText color={colors.textMuted} style={styles.subtitle}>
            Join 50,000+ farmers using Anaaj.ai to increase their yield by up to 30%.
          </AppText>
        </Animated.View>

        {/* Current Usage Card if on a plan */}
        {subscriptionStatus && (
          <GlassCard style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Pill label={currentTier.toUpperCase() + " PLAN"} color={colors.primary} active />
              <AppText variant="caption" color={colors.textMuted}>Current Month</AppText>
            </View>
            
            <View style={styles.progressRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption">AI Chats: {subscriptionStatus.chatsUsed} / {subscriptionStatus.chatsLimit}</AppText>
                <ProgressBar progress={(subscriptionStatus.chatsUsed / (subscriptionStatus.chatsLimit || 1)) * 100} color={colors.primary} />
              </View>
              <View style={{ width: 20 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption">Crop Scans: {subscriptionStatus.scansUsed} / {subscriptionStatus.scansLimit}</AppText>
                <ProgressBar progress={(subscriptionStatus.scansUsed / (subscriptionStatus.scansLimit || 1)) * 100} color="#52B781" />
              </View>
            </View>
          </GlassCard>
        )}

        <View style={styles.section}>
          <AppText variant="heading" style={styles.sectionTitle}>Why Upgrade?</AppText>
          <View style={styles.featureGrid}>
            {features.map((f, i) => (
              <Animated.View key={f.title} entering={FadeInDown.delay(300 + i * 100)} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '10' }]}>
                   {(() => { const Icon = IconMap[f.icon]; return Icon ? <Icon size={20} color={colors.primary} /> : null; })()}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" style={{ fontSize: 15 }}>{f.title}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>{f.subtitle}</AppText>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.plansSection}>
          <PlanCard 
            title="Basic"
            price="₹149"
            period="/month"
            perks={['50 AI Chats', '3 Image Scans', 'Topup Enabled']}
            selected={selectedPlan === 'basic'}
            isCurrent={currentTier === 'basic'}
            onSelect={() => setSelectedPlan('basic')}
          />
          <PlanCard 
            title="Pro"
            price="₹199"
            period="/month"
            popular
            perks={['100 AI Chats', '10 Image Scans', '7-day rollover', 'Mandi alerts']}
            selected={selectedPlan === 'pro'}
            isCurrent={currentTier === 'pro'}
            onSelect={() => setSelectedPlan('pro')}
          />
        </View>

        <GradientButton 
          label={currentTier === 'free' ? "UPGRADE NOW" : "RENEW PLAN"} 
          onPress={handlePayment} 
          style={styles.actionBtn} 
        />
        <AppText variant="caption" color={colors.textMuted} style={styles.termsText}>
          Razorpay mock checkout active for development. Real gateway integration can be swapped in later.
        </AppText>
      </View>

      <Modal transparent visible={showPaymentModal} animationType="fade">
        <View style={styles.modalOverlay}>
           <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.blurBg} />
           <Animated.View entering={ZoomIn} style={[styles.paymentCard, { backgroundColor: isDark ? '#1A1D1A' : '#FFF' }]}>
             <View style={styles.paymentHeader}>
               <AppText color="#fff" style={{ fontWeight: '700' }}>ANAJ PAY</AppText>
               <Pill label="SECURE" color="#52B781" />
             </View>
             
             <View style={styles.paymentBody}>
               {paymentStatus === 'success' ? (
                 <Animated.View entering={ZoomIn} style={{ alignItems: 'center' }}>
                   <View style={styles.successIcon}>
                      {(() => { const Icon = IconMap['Check']; return Icon ? <Icon size={40} color="#fff" /> : null; })()}
                   </View>
                   <AppText variant="heading" style={{ marginTop: 20 }}>Payment Successful</AppText>
                   <AppText color={colors.textMuted} style={{ marginTop: 8 }}>Your plan and wallet have been updated.</AppText>
                 </Animated.View>
               ) : (
                 <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText style={{ marginTop: 24, fontSize: 18, fontWeight: '600' }}>
                      {paymentStatus === 'processing' ? 'Completing Transaction...' : 'Verifying with Bank...'}
                    </AppText>
                    <AppText color={colors.textMuted} style={{ marginTop: 8 }}>Please do not close the app</AppText>
                 </View>
               )}
             </View>
           </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}

function PlanCard({ title, price, period, perks, selected, isCurrent, popular, onSelect }: any) {
  const { colors, isDark } = useTheme();
  
  return (
    <Pressable onPress={onSelect} style={[
      styles.planCard, 
      { 
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        borderColor: selected ? colors.primary : colors.border,
        borderWidth: selected ? 2 : 1
      }
    ]}>
      {popular && (
        <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
          <AppText variant="caption" color="#fff" style={{ fontWeight: '800', fontSize: 10 }}>MOST POPULAR</AppText>
        </View>
      )}
      {isCurrent && (
        <View style={styles.currentBadge}>
          <AppText variant="caption" color={colors.primary} style={{ fontWeight: '800', fontSize: 10 }}>CURRENT PLAN</AppText>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View>
          <AppText variant="heading" style={{ fontSize: 20 }}>{title}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <AppText variant="title" color={colors.primary} style={{ fontSize: 24 }}>{price}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{period}</AppText>
          </View>
        </View>
        <View style={[styles.selectCircle, { borderColor: selected ? colors.primary : colors.border }]}>
          {selected && <View style={[styles.selectDot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>

      <View style={styles.perksList}>
        {perks.map((p: string, i: number) => (
          <View key={i} style={styles.perkItem}>
            {(() => { const Icon = IconMap['Check']; return Icon ? <Icon size={14} color={colors.primary} /> : null; })()}
            <AppText variant="caption" style={{ flex: 1 }}>{p}</AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { width: '100%', height: 260 },
  content: { paddingHorizontal: 20, marginTop: -40, paddingBottom: 60 },
  title: { fontSize: 32, lineHeight: 40 },
  subtitle: { marginTop: 12, fontSize: 16, lineHeight: 24 },
  usageCard: { marginTop: 24, padding: 16 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressRow: { flexDirection: 'row' },
  section: { marginTop: 40 },
  sectionTitle: { marginBottom: 20, fontSize: 20 },
  featureGrid: { gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  plansSection: { marginTop: 40, gap: 20 },
  planCard: { borderRadius: 24, padding: 24, position: 'relative' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  selectCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  selectDot: { width: 12, height: 12, borderRadius: 6 },
  perksList: { marginTop: 24, gap: 12 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  popularBadge: { position: 'absolute', top: -12, left: 24, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  currentBadge: { position: 'absolute', top: 24, right: 60 },
  actionBtn: { marginTop: 40, height: 64, borderRadius: 20 },
  termsText: { textAlign: 'center', marginTop: 16 },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blurBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  paymentCard: { width: '85%', borderRadius: 32, overflow: 'hidden' },
  paymentHeader: { padding: 24, backgroundColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentBody: { padding: 40, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#52B781', alignItems: 'center', justifyContent: 'center' },
});
