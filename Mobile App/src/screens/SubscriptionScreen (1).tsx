/**
 * SubscriptionScreen — Plans + Topup tabs.
 *
 * Tab 1 — Plans: Free / Kisan Basic (₹149) / Kisan Pro (₹199)
 * Tab 2 — Topup: Chat packs + Scan packs
 */

import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { apiService } from "../api/services";
import { AppText, GradientButton, Screen } from "../components/ui";
import { IconMap } from "../components/IconMap";
import { useTheme } from "../providers/ThemeContext";
import {
  useWalletStore,
  PLAN_CONFIGS,
  CHAT_TOPUP_PACKS,
  SCAN_TOPUP_PACKS,
} from "../store/useWalletStore";
import { RootStackParamList } from "../navigation/types";
import type { PlanConfig, TopupPack } from "../types/api";

// ─── Tab bar ─────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
}: {
  active: "plans" | "topup";
  onChange: (tab: "plans" | "topup") => void;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      {(["plans", "topup"] as const).map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          style={[
            styles.tabItem,
            active === tab && { backgroundColor: colors.primary },
          ]}
        >
          <AppText
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: active === tab ? "#fff" : colors.textMuted,
            }}
          >
            {tab === "plans" ? "📋 Plans" : "⚡ Topup"}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  isCurrent,
  onSelect,
}: {
  plan: PlanConfig;
  selected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const { colors, isDark } = useTheme();
  const CheckIcon = IconMap["Check"];

  const perks: string[] = [
    `${plan.chatCredits} AI Chats / month`,
    `${plan.imageCredits} Image ${plan.imageCredits === 1 ? "Scan" : "Scans"} / month`,
    plan.topupAllowed ? "Topup allowed" : "No topup",
    plan.rollover ? "7-day credit rollover" : "No rollover",
    ...(plan.mandiAlerts ? ["Mandi price alerts 🔔"] : []),
  ];

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.planCard,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {plan.popular && (
        <LinearGradient
          colors={[colors.primary, colors.primary + "CC"]}
          style={styles.popularBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
            ⭐ MOST POPULAR
          </AppText>
        </LinearGradient>
      )}
      {isCurrent && (
        <View
          style={[
            styles.currentBadge,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <AppText
            style={{ color: colors.primary, fontSize: 10, fontWeight: "800" }}
          >
            ✓ CURRENT
          </AppText>
        </View>
      )}
      <View style={styles.planHeader}>
        <View>
          <AppText
            style={{
              fontSize: 11,
              color: colors.textMuted,
              fontWeight: "600",
              letterSpacing: 1,
            }}
          >
            {plan.nameHi}
          </AppText>
          <AppText variant="heading" style={{ fontSize: 22, marginTop: 2 }}>
            {plan.name}
          </AppText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 2,
              marginTop: 6,
            }}
          >
            <AppText
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.primary,
              }}
            >
              {plan.price === 0 ? "Free" : `₹${plan.price}`}
            </AppText>
            {plan.price > 0 && (
              <AppText variant="caption" color={colors.textMuted}>
                /month
              </AppText>
            )}
          </View>
        </View>
        <View
          style={[
            styles.selectCircle,
            { borderColor: selected ? colors.primary : colors.border },
          ]}
        >
          {selected && (
            <View
              style={[styles.selectDot, { backgroundColor: colors.primary }]}
            />
          )}
        </View>
      </View>
      <View style={[styles.planDivider, { backgroundColor: colors.border }]} />
      <View style={{ gap: 10 }}>
        {perks.map((perk, i) => (
          <View key={i} style={styles.perkRow}>
            {CheckIcon && (
              <CheckIcon
                size={14}
                color={
                  plan.tier === "free" && i >= 2
                    ? colors.textMuted
                    : colors.primary
                }
              />
            )}
            <AppText
              variant="caption"
              style={{
                flex: 1,
                color:
                  plan.tier === "free" && i >= 2 ? colors.textMuted : undefined,
              }}
            >
              {perk}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

// ─── Topup pack card ──────────────────────────────────────────────────────────

function TopupPackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: TopupPack;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors, isDark } = useTheme();
  const accentColor = pack.type === "chat" ? colors.primary : "#3B82F6";

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.topupCard,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          borderColor: selected ? accentColor : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {pack.tag && (
        <View style={[styles.packTag, { backgroundColor: accentColor }]}>
          <AppText style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>
            {pack.tag}
          </AppText>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="label" style={{ fontSize: 15 }}>
          {pack.label}
        </AppText>
        <AppText
          variant="caption"
          color={colors.textMuted}
          style={{ marginTop: 2 }}
        >
          ₹{(pack.price / pack.credits).toFixed(0)} per{" "}
          {pack.type === "chat" ? "chat" : "scan"}
        </AppText>
      </View>
      <AppText
        style={{ fontSize: 20, fontWeight: "800", color: accentColor }}
      >
        ₹{pack.price}
      </AppText>
    </Pressable>
  );
}

// ─── Usage card ───────────────────────────────────────────────────────────────

function UsageCard() {
  const { colors } = useTheme();
  const wallet = useWalletStore((s) => s.wallet);
  const totalChatCredits = useWalletStore((s) => s.totalChatCredits);
  const totalScanCredits = useWalletStore((s) => s.totalScanCredits);
  const currentPlan = useWalletStore((s) => s.currentPlan);

  if (!wallet) return null;

  const plan = currentPlan();
  const chatTotal = plan?.chatCredits ?? 10;
  const scanTotal = plan?.imageCredits ?? 1;
  const chatUsed = wallet.totalChatsUsed ?? 0;
  const scanUsed = wallet.totalScansUsed ?? 0;
  const chatPct = Math.min(100, (chatUsed / Math.max(chatTotal, 1)) * 100);
  const scanPct = Math.min(100, (scanUsed / Math.max(scanTotal, 1)) * 100);

  return (
    <Animated.View
      entering={FadeIn.delay(100)}
      style={[
        styles.usageCard,
        {
          backgroundColor: colors.primary + "10",
          borderColor: colors.primary + "30",
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <AppText
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: colors.primary,
              letterSpacing: 1,
            }}
          >
            {wallet.plan.toUpperCase()} PLAN
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Is mahine ka usage
          </AppText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <AppText style={{ fontWeight: "700" }}>
            {totalChatCredits()} chats
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {totalScanCredits()} scans baaki
          </AppText>
        </View>
      </View>
      <View style={{ marginBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <AppText variant="caption">
            💬 Used: {chatUsed}/{chatTotal}
          </AppText>
          {(wallet.topupCredits ?? 0) > 0 && (
            <AppText
              variant="caption"
              style={{ color: colors.primary }}
            >
              +{wallet.topupCredits} topup
            </AppText>
          )}
        </View>
        <View
          style={[styles.progressBg, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${chatPct}%` as any,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <AppText variant="caption">
            📷 Used: {scanUsed}/{scanTotal}
          </AppText>
          {(wallet.topupImageCredits ?? 0) > 0 && (
            <AppText variant="caption" style={{ color: "#3B82F6" }}>
              +{wallet.topupImageCredits} topup
            </AppText>
          )}
        </View>
        <View
          style={[styles.progressBg, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${scanPct}%` as any, backgroundColor: "#3B82F6" },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function SubscriptionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { colors, isDark } = useTheme();

  const wallet = useWalletStore((s) => s.wallet);
  const setWallet = useWalletStore((s) => s.setWallet);

  const initialTab: "plans" | "topup" = route.params?.tab ?? "plans";
  const [activeTab, setActiveTab] = useState<"plans" | "topup">(initialTab);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("pro");
  const [selectedChatPack, setSelectedChatPack] = useState<string | null>(null);
  const [selectedScanPack, setSelectedScanPack] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const currentTier = wallet?.plan ?? "free";

  const walletQuery = useQuery({
    queryKey: ["wallet"],
    queryFn: () => apiService.getWallet(),
    gcTime: 0,
  });

  useEffect(() => {
    if (walletQuery.data) setWallet(walletQuery.data);
  }, [walletQuery.data]);

  const handleSubscribe = async () => {
    if (paying) return;
    setPaying(true);
    try {
      await apiService.processDummyPayment(selectedPlan);
      const updated = await apiService.getWallet();
      setWallet(updated);
      const planName = PLAN_CONFIGS.find((p) => p.tier === selectedPlan)?.name;
      Alert.alert(
        "✅ Subscription Active!",
        `Aapka ${planName} plan activate ho gaya.`,
        [{ text: "Great!", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Payment Failed", e?.message ?? "Dobara try karo.");
    } finally {
      setPaying(false);
    }
  };

  const handleTopupPurchase = async () => {
    const packId = selectedChatPack ?? selectedScanPack;
    if (!packId || paying) return;
    const allPacks = [...CHAT_TOPUP_PACKS, ...SCAN_TOPUP_PACKS];
    const pack = allPacks.find((p) => p.id === packId);
    if (!pack) return;
    Alert.alert(
      "Topup — Coming Soon",
      `Rs.${pack.price} ka topup pack jald available hoga! Abhi subscription try karo.`
    );
  };

  const paidPlans = PLAN_CONFIGS.filter((p) => p.tier !== "free");
  const selectedPackPrice = [
    ...CHAT_TOPUP_PACKS,
    ...SCAN_TOPUP_PACKS,
  ].find((p) => p.id === (selectedChatPack ?? selectedScanPack))?.price;

  return (
    <Screen scrollable={false} padded={false}>
      <LinearGradient
        colors={[colors.primary + "20", "transparent"]}
        style={styles.headerGradient}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          {(() => {
            const I = IconMap["ArrowLeft"];
            return I ? <I size={24} color={colors.text} /> : null;
          })()}
        </Pressable>
        <AppText variant="title">Anaaj AI Plans</AppText>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {wallet && <UsageCard />}

        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* ── Plans tab ── */}
        {activeTab === "plans" && (
          <Animated.View entering={FadeInDown.duration(250)}>
            <AppText
              variant="caption"
              color={colors.textMuted}
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              UPI · Card · Wallet — sab accept hota hai
            </AppText>

            <View
              style={[
                styles.freeBanner,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "#F0FDF4",
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText style={{ fontWeight: "700" }}>
                Free Plan{currentTier === "free" ? " ✓ (Current)" : ""}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                10 chats · 1 scan · No topup · No rollover
              </AppText>
            </View>

            {paidPlans.map((plan) => (
              <Animated.View key={plan.tier} entering={FadeInDown.delay(100)}>
                <PlanCard
                  plan={plan}
                  selected={selectedPlan === plan.tier}
                  isCurrent={currentTier === plan.tier}
                  onSelect={() =>
                    setSelectedPlan(plan.tier as "basic" | "pro")
                  }
                />
              </Animated.View>
            ))}

            <View
              style={[
                styles.insightBox,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              {(() => {
                const I = IconMap["Info"];
                return I ? <I size={16} color={colors.primary} /> : null;
              })()}
              <AppText
                variant="caption"
                color={colors.textMuted}
                style={{ flex: 1 }}
              >
                Ek active farmer din mein 2-3 sawaal poochta hai. 50 chats
                se poora mahina comfortable hota hai → trust banta hai →
                renewal hoti hai.
              </AppText>
            </View>

            {currentTier !== selectedPlan ? (
              <GradientButton
                label={
                  paying
                    ? "Processing..."
                    : `SUBSCRIBE — ₹${PLAN_CONFIGS.find((p) => p.tier === selectedPlan)?.price}`
                }
                onPress={handleSubscribe}
                style={styles.ctaBtn}
                disabled={paying}
              />
            ) : (
              <View
                style={[
                  styles.currentPlanBanner,
                  { borderColor: colors.primary },
                ]}
              >
                {(() => {
                  const I = IconMap["CheckCircle2"];
                  return I ? (
                    <I size={20} color={colors.primary} />
                  ) : null;
                })()}
                <AppText style={{ color: colors.primary, fontWeight: "700" }}>
                  Yeh aapka current plan hai
                </AppText>
              </View>
            )}

            <AppText
              variant="caption"
              color={colors.textMuted}
              style={{ textAlign: "center", marginTop: 12 }}
            >
              Razorpay se secure payment · Kabhi bhi cancel karein
            </AppText>
          </Animated.View>
        )}

        {/* ── Topup tab ── */}
        {activeTab === "topup" && (
          <Animated.View entering={FadeInDown.duration(250)}>
            {currentTier === "free" && (
              <View
                style={[
                  styles.topupWarning,
                  {
                    backgroundColor: "#F59E0B15",
                    borderColor: "#F59E0B40",
                  },
                ]}
              >
                {(() => {
                  const I = IconMap["AlertCircle"];
                  return I ? <I size={16} color="#F59E0B" /> : null;
                })()}
                <AppText
                  variant="caption"
                  style={{ flex: 1, color: "#F59E0B" }}
                >
                  Free plan mein topup nahi hota. Basic ya Pro subscribe
                  karo.
                </AppText>
              </View>
            )}

            <AppText
              variant="label"
              style={{ marginBottom: 12, fontSize: 16 }}
            >
              💬 Chat Packs
            </AppText>
            {CHAT_TOPUP_PACKS.map((pack) => (
              <TopupPackCard
                key={pack.id}
                pack={pack}
                selected={selectedChatPack === pack.id}
                onSelect={() => {
                  setSelectedChatPack(
                    selectedChatPack === pack.id ? null : pack.id
                  );
                  setSelectedScanPack(null);
                }}
              />
            ))}

            <AppText
              variant="label"
              style={{ marginTop: 24, marginBottom: 12, fontSize: 16 }}
            >
              📷 Image Scan Packs
            </AppText>
            {SCAN_TOPUP_PACKS.map((pack) => (
              <TopupPackCard
                key={pack.id}
                pack={pack}
                selected={selectedScanPack === pack.id}
                onSelect={() => {
                  setSelectedScanPack(
                    selectedScanPack === pack.id ? null : pack.id
                  );
                  setSelectedChatPack(null);
                }}
              />
            ))}

            <View
              style={[
                styles.insightBox,
                {
                  backgroundColor: "#3B82F610",
                  borderColor: "#3B82F630",
                  marginTop: 20,
                },
              ]}
            >
              {(() => {
                const I = IconMap["Info"];
                return I ? <I size={16} color="#3B82F6" /> : null;
              })()}
              <AppText
                variant="caption"
                color={colors.textMuted}
                style={{ flex: 1 }}
              >
                Topup credits kabhi expire nahi hote. Pehle topup use
                hota hai, phir plan ke credits.
              </AppText>
            </View>

            <GradientButton
              label={
                selectedPackPrice
                  ? `BUY — ₹${selectedPackPrice}`
                  : "SELECT A PACK"
              }
              onPress={handleTopupPurchase}
              style={[
                styles.ctaBtn,
                {
                  opacity: selectedChatPack ?? selectedScanPack ? 1 : 0.5,
                },
              ]}
              disabled={!(selectedChatPack ?? selectedScanPack) || paying}
            />

            <AppText
              variant="caption"
              color={colors.textMuted}
              style={{ textAlign: "center", marginTop: 12 }}
            >
              Razorpay UPI · Card · Wallet
            </AppText>
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  usageCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  tabBar: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  freeBanner: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },
  planCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -1,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  currentBadge: {
    position: "absolute",
    top: 16,
    right: 56,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  selectDot: { width: 12, height: 12, borderRadius: 6 },
  planDivider: { height: 1, marginVertical: 16 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  insightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 16,
  },
  topupWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  topupCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    position: "relative",
    gap: 12,
  },
  packTag: {
    position: "absolute",
    top: -1,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  ctaBtn: { height: 60, borderRadius: 20, marginTop: 16 },
  currentPlanBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
  },
});
