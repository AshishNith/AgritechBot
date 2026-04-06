/**
 * useWalletStore — manages the user's credit wallet state.
 *
 * Credits priority (per design doc):
 *   topupCredits are consumed FIRST, then plan credits.
 *   On subscription reset: only plan credits reset; topup credits are safe.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PlanConfig, SubscriptionTier, TopupPack, Wallet } from '../types/api';

// ─── Static plan configs (matches design doc) ────────────────────────────────

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    tier: 'free',
    name: 'Free',
    nameHi: 'Free',
    price: 0,
    chatCredits: 10,
    imageCredits: 1,
    rollover: false,
    topupAllowed: false,
    mandiAlerts: false,
  },
  {
    tier: 'basic',
    name: 'Kisan Basic',
    nameHi: 'किसान बेसिक',
    price: 149,
    chatCredits: 50,
    imageCredits: 3,
    rollover: false,
    topupAllowed: true,
    mandiAlerts: false,
  },
  {
    tier: 'pro',
    name: 'Kisan Pro',
    nameHi: 'किसान प्रो ⭐',
    price: 199,
    chatCredits: 100,
    imageCredits: 10,
    rollover: true,      // 7-day rollover
    topupAllowed: true,
    mandiAlerts: true,
    popular: true,
  },
];

// ─── Topup packs ─────────────────────────────────────────────────────────────

export const CHAT_TOPUP_PACKS: TopupPack[] = [
  { id: 'chat_10', label: '10 Chats', credits: 10, price: 49, type: 'chat' },
  { id: 'chat_25', label: '25 Chats', credits: 25, price: 99, type: 'chat', tag: 'POPULAR' },
  { id: 'chat_60', label: '60 Chats', credits: 60, price: 199, type: 'chat', tag: 'BEST VALUE' },
];

export const SCAN_TOPUP_PACKS: TopupPack[] = [
  { id: 'scan_1', label: '1 Scan', credits: 1, price: 29, type: 'scan' },
  { id: 'scan_3', label: '3 Scans', credits: 3, price: 69, type: 'scan', tag: 'POPULAR' },
  { id: 'scan_10', label: '10 Scans', credits: 10, price: 179, type: 'scan', tag: 'BEST VALUE' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  lastFetched: number | null;
  chatPaywallVisible: boolean;
  scanPaywallVisible: boolean;

  // Actions
  setWallet: (wallet: Wallet | null) => void;
  setLoading: (loading: boolean) => void;
  setChatPaywallVisible: (visible: boolean) => void;
  setScanPaywallVisible: (visible: boolean) => void;

  // Derived helpers
  totalChatCredits: () => number;
  totalScanCredits: () => number;
  canChat: () => boolean;
  canScan: () => boolean;
  currentPlan: () => PlanConfig | undefined;

  // Optimistic deductions (server confirms afterward)
  deductChatCredit: () => void;
  deductScanCredit: () => void;

  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist<WalletState, [], [], Partial<WalletState>>(
    (set, get) => ({
      wallet: null,
      isLoading: false,
      lastFetched: null,
      chatPaywallVisible: false,
      scanPaywallVisible: false,

      setWallet: (wallet) => set({ wallet, lastFetched: Date.now() }),
      setLoading: (isLoading) => set({ isLoading }),
      setChatPaywallVisible: (chatPaywallVisible) => set({ chatPaywallVisible }),
      setScanPaywallVisible: (scanPaywallVisible) => set({ scanPaywallVisible }),

      // Total available chats = topup + plan credits
      totalChatCredits: () => {
        const w = get().wallet;
        if (!w) return 0;
        return (w.topupCredits ?? 0) + (w.chatCredits ?? 0);
      },

      // Total available scans = topup + plan credits
      totalScanCredits: () => {
        const w = get().wallet;
        if (!w) return 0;
        return (w.topupImageCredits ?? 0) + (w.imageCredits ?? 0);
      },

      canChat: () => get().totalChatCredits() > 0,
      canScan: () => get().totalScanCredits() > 0,

      currentPlan: () => PLAN_CONFIGS.find((p) => p.tier === get().wallet?.plan),

      // Optimistic deduction: topup first, then plan credits
      deductChatCredit: () => {
        const w = get().wallet;
        if (!w) return;
        
        // Don't deduct if no credits available
        if (get().totalChatCredits() <= 0) return;
        
        if (w.topupCredits > 0) {
          set({ wallet: { ...w, topupCredits: w.topupCredits - 1, totalChatsUsed: w.totalChatsUsed + 1 } });
        } else if (w.chatCredits > 0) {
          set({ wallet: { ...w, chatCredits: w.chatCredits - 1, totalChatsUsed: w.totalChatsUsed + 1 } });
        }
      },

      deductScanCredit: () => {
        const w = get().wallet;
        if (!w) return;
        
        // Don't deduct if no credits available
        if (get().totalScanCredits() <= 0) return;
        
        if (w.topupImageCredits > 0) {
          set({ wallet: { ...w, topupImageCredits: w.topupImageCredits - 1, totalScansUsed: w.totalScansUsed + 1 } });
        } else if (w.imageCredits > 0) {
          set({ wallet: { ...w, imageCredits: w.imageCredits - 1, totalScansUsed: w.totalScansUsed + 1 } });
        }
      },

      reset: () => set({ wallet: null, isLoading: false, lastFetched: null, chatPaywallVisible: false, scanPaywallVisible: false }),
    }),
    {
      name: 'anaaj-wallet-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ wallet: state.wallet, lastFetched: state.lastFetched }),
    }
  )
);
