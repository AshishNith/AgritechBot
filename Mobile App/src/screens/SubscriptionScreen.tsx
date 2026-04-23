import React, { useState, useEffect } from 'react';
import { Alert, Image, Pressable, StyleSheet, View, ActivityIndicator, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, GlassCard, ProgressBar, Pill } from '../components/ui';
import { designImages } from '../constants/designData';
import { useAppStore } from '../store/useAppStore';
import { useWallet } from '../hooks/useWallet';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { IconMap } from '../components/IconMap';
import { CHAT_TOPUP_PACKS, SCAN_TOPUP_PACKS, PLAN_CONFIGS, useWalletStore } from '../store/useWalletStore';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';

const features = [
  { title: 'aiCropDoctorTitle', subtitle: 'aiCropDoctorSub', icon: 'Scan' },
  { title: 'krishiAssistantTitle', subtitle: 'krishiAssistantSub', icon: 'MessageSquare' },
  { title: 'multiLingualTitle', subtitle: 'multiLingualSub', icon: 'Languages' },
  { title: 'expertPriorityTitle', subtitle: 'expertPrioritySub', icon: 'Zap' },
] as const;

type TopupPackId = 'chat_10' | 'chat_25' | 'chat_60' | 'scan_1' | 'scan_3' | 'scan_10';

export function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Subscription'>>();
  const { isDark, colors } = useTheme();
  const { t: tx } = useI18n();
  const { wallet, refetchWallet } = useWallet();
  const user = useAppStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<'plans' | 'topup'>(route.params?.tab || 'plans');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('pro');
  const [selectedTopup, setSelectedTopup] = useState<{ id: TopupPackId; type: 'chat' | 'scan'; amount: number } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === 'plans') {
        const order = await apiService.createSubscriptionOrder(selectedPlan);
        const paymentData = await openRazorpayCheckout({
          order,
          description: `${selectedPlan.toUpperCase()} subscription`,
          prefill: {
            name: user?.name,
            contact: user?.phone,
          },
        });

        return apiService.verifyWalletPayment({
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          purpose: 'subscription',
          tier: selectedPlan,
        });
      } else {
        if (!selectedTopup) throw new Error("No topup selected");
        const order = await apiService.createTopupOrder(selectedTopup.id);
        const paymentData = await openRazorpayCheckout({
          order,
          description: `${selectedTopup.type === 'chat' ? 'Chat' : 'Scan'} topup`,
          prefill: {
            name: user?.name,
            contact: user?.phone,
          },
        });

        return apiService.verifyWalletPayment({
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          purpose: 'topup',
          packId: selectedTopup.id,
        });
      }
    },
    onSuccess: (data: any) => {
      setPaymentStatus('processing');
      setTimeout(() => {
        setPaymentStatus('success');
        
        // ✅ Real-time wallet update after payment
        if (data.wallet) {
          useWalletStore.getState().setWallet(data.wallet);
        } else {
          void refetchWallet();
        }

        setTimeout(() => {
          setShowPaymentModal(false);
          const msg = activeTab === 'plans' 
            ? `${tx('welcomeBack')} Anaaj ${selectedPlan.toUpperCase()}!`
            : tx('paymentSuccessSub');
          Alert.alert(tx('paymentSuccessTitle'), msg);
          navigation.goBack();
        }, 1500);
      }, 2000);
    },
    onError: () => {
      setShowPaymentModal(false);
      setPaymentStatus('idle');
      Alert.alert(tx('paymentFailed'), 'Payment was cancelled or could not be completed.');
    },
  });

  const handlePayment = () => {
    if (activeTab === 'topup' && !selectedTopup) {
      Alert.alert(tx('subscriptionTitle'), tx('tryDifferentFilters'));
      return;
    }
    setShowPaymentModal(true);
    setPaymentStatus('idle');
    processPaymentMutation.mutate();
  };

  const currentTier = wallet?.plan || 'free';

  return (
    <Screen scrollable padded={false}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
           {(() => { const Icon = IconMap['ArrowLeft']; return Icon ? <Icon size={24} color={colors.text} /> : null; })()}
        </Pressable>
        <AppText variant="title">{tx('subscriptionTitle')}</AppText>
        <View style={{ width: 44 }} />
      </View>

      <Image source={{ uri: designImages.premiumHero }} style={styles.hero} />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <AppText variant="display" style={styles.title}>
            {tx('masterYourHarvest')}
          </AppText>
          <AppText color={colors.textMuted} style={styles.subtitle}>
            {tx('subscriptionSubtitle')}
          </AppText>
        </Animated.View>

        {/* Wallet Usage Card */}
        {wallet && currentTier !== 'free' && (
          <GlassCard style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Pill label={currentTier.toUpperCase() + " " + tx('plan')} color={colors.primary} active />
              <AppText variant="caption" color={colors.textMuted}>{tx('remainingCredits')}</AppText>
            </View>
            
            <View style={styles.progressRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ marginBottom: 4 }}>
                  {tx('aiChatsLabel')}: <AppText variant="label" color={colors.primary}>{wallet.chatCredits + (wallet.topupCredits || 0)}</AppText>
                </AppText>
                <ProgressBar progress={Math.min(100, ((wallet.chatCredits + (wallet.topupCredits || 0)) / (PLAN_CONFIGS.find(p => p.tier === currentTier)?.chatCredits || 1)) * 100)} color={colors.primary} />
              </View>
              <View style={{ width: 20 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ marginBottom: 4 }}>
                  {tx('cropScansLabel')}: <AppText variant="label" color="#52B781">{wallet.imageCredits + (wallet.topupImageCredits || 0)}</AppText>
                </AppText>
                <ProgressBar progress={Math.min(100, ((wallet.imageCredits + (wallet.topupImageCredits || 0)) / (PLAN_CONFIGS.find(p => p.tier === currentTier)?.imageCredits || 1)) * 100)} color="#52B781" />
              </View>
            </View>
          </GlassCard>
        )}

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Pressable 
            onPress={() => setActiveTab('plans')}
            style={[styles.tab, activeTab === 'plans' && { backgroundColor: isDark ? '#2D332D' : '#fff', elevation: 2 }]}
          >
            <AppText variant="label" color={activeTab === 'plans' ? colors.primary : colors.textMuted}>{tx('monthlyPlansLabel')}</AppText>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('topup')}
            style={[styles.tab, activeTab === 'topup' && { backgroundColor: isDark ? '#2D332D' : '#fff', elevation: 2 }]}
          >
            <AppText variant="label" color={activeTab === 'topup' ? colors.primary : colors.textMuted}>{tx('topUpsLabel')}</AppText>
          </Pressable>
        </View>

        {activeTab === 'plans' ? (
          <>
            <View style={styles.section}>
              <AppText variant="heading" style={styles.sectionTitle}>Why Upgrade?</AppText>
              <View style={styles.featureGrid}>
                {features.map((f, i) => (
                  <Animated.View key={f.title} entering={FadeInDown.delay(100 + i * 50)} style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: colors.primary + '10' }]}>
                       {(() => { const Icon = IconMap[f.icon]; return Icon ? <Icon size={20} color={colors.primary} /> : null; })()}
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="label" style={{ fontSize: 15 }}>{tx(f.title as any)}</AppText>
                      <AppText variant="caption" color={colors.textMuted}>{tx(f.subtitle as any)}</AppText>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            <View style={styles.plansSection}>
              <PlanCard 
                title={tx('basicPlanTitle')}
                price="₹149"
                period={tx('perMonth')}
                perks={[tx('planPerk1'), tx('planPerk2'), tx('planPerk3')]}
                selected={selectedPlan === 'basic'}
                isCurrent={currentTier === 'basic'}
                onSelect={() => setSelectedPlan('basic')}
              />
              <PlanCard 
                title={tx('proPlanTitle')}
                price="₹199"
                period={tx('perMonth')}
                popular
                perks={[tx('planPerk4'), tx('planPerk5'), tx('planPerk6'), tx('planPerk7')]}
                selected={selectedPlan === 'pro'}
                isCurrent={currentTier === 'pro'}
                onSelect={() => setSelectedPlan('pro')}
              />
            </View>
          </>
        ) : (
          <View style={styles.topupSection}>
            <AppText variant="heading" style={styles.sectionTitle}>{tx('addExtraCredits')}</AppText>
            <AppText color={colors.textMuted} style={{ marginBottom: 20 }}>{tx('topupDisclaimer')}</AppText>
            
            <AppText variant="label" style={{ marginBottom: 12 }}>{tx('aiChatPacks')}</AppText>
            <View style={styles.packGrid}>
              {CHAT_TOPUP_PACKS.map((pack) => (
                <Pressable 
                  key={pack.id} 
                    onPress={() => setSelectedTopup({ id: pack.id as TopupPackId, type: 'chat', amount: pack.price })}
                  style={[
                    styles.packCard, 
                    { borderColor: selectedTopup?.id === pack.id ? colors.primary : colors.border },
                    selectedTopup?.id === pack.id && { backgroundColor: colors.primary + '08' }
                  ]}
                >
                  {pack.tag && (
                    <View style={[styles.packTag, { backgroundColor: colors.primary }]}>
                      <AppText style={{ fontSize: 8, color: '#fff', fontWeight: '800' }}>{pack.tag}</AppText>
                    </View>
                  )}
                  <AppText variant="title" color={colors.primary}>{pack.credits}</AppText>
                  <AppText variant="caption">{tx('chats')}</AppText>
                  <AppText variant="label" style={{ marginTop: 8 }}>₹{pack.price}</AppText>
                </Pressable>
              ))}
            </View>

            <AppText variant="label" style={{ marginBottom: 12, marginTop: 24 }}>{tx('imageScanPacks')}</AppText>
            <View style={styles.packGrid}>
              {SCAN_TOPUP_PACKS.map((pack) => (
                <Pressable 
                  key={pack.id} 
                    onPress={() => setSelectedTopup({ id: pack.id as TopupPackId, type: 'scan', amount: pack.price })}
                  style={[
                    styles.packCard, 
                    { borderColor: selectedTopup?.id === pack.id ? colors.primary : colors.border },
                    selectedTopup?.id === pack.id && { backgroundColor: colors.primary + '08' }
                  ]}
                >
                  {pack.tag && (
                    <View style={[styles.packTag, { backgroundColor: colors.primary }]}>
                      <AppText style={{ fontSize: 8, color: '#fff', fontWeight: '800' }}>{pack.tag}</AppText>
                    </View>
                  )}
                  <AppText variant="title" color="#52B781">{pack.credits}</AppText>
                  <AppText variant="caption">{pack.credits === 1 ? tx('scanLabel') : tx('scansLabel')}</AppText>
                  <AppText variant="label" style={{ marginTop: 8 }}>₹{pack.price}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <GradientButton 
          label={activeTab === 'plans' ? (currentTier === 'free' ? tx('upgradeNow') : tx('renewPlan')) : (tx('buyCredits') + ` ${selectedTopup ? selectedTopup.id.split('_')[1].toUpperCase() : ''}`)} 
          onPress={handlePayment} 
          style={styles.actionBtn} 
          loading={processPaymentMutation.isPending}
        />
        <AppText variant="caption" color={colors.textMuted} style={styles.termsText}>
          {tx('secureConnection')}
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
                      {paymentStatus === 'processing' ? tx('completingTransaction') : tx('verifyingBank')}
                    </AppText>
                    <AppText color={colors.textMuted} style={{ marginTop: 8 }}>{tx('doNotCloseApp')}</AppText>
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
  const { t: tx } = useI18n();
  
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
          <AppText variant="caption" color="#fff" style={{ fontWeight: '800', fontSize: 10 }}>{tx('mostPopular')}</AppText>
        </View>
      )}
      {isCurrent && (
        <View style={styles.currentBadge}>
          <AppText variant="caption" color={colors.primary} style={{ fontWeight: '800', fontSize: 10 }}>{tx('currentPlan')}</AppText>
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
  tabBar: { flexDirection: 'row', marginTop: 32, borderRadius: 16, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  topupSection: { marginTop: 40 },
  packGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  packCard: { flex: 1, borderRadius: 20, borderWidth: 2, padding: 16, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', position: 'relative' },
  packTag: { position: 'absolute', top: -10, right: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blurBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  paymentCard: { width: '85%', borderRadius: 32, overflow: 'hidden' },
  paymentHeader: { padding: 24, backgroundColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentBody: { padding: 40, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#52B781', alignItems: 'center', justifyContent: 'center' },
});
