/**
 * useWallet — convenience hook for consuming wallet state in screens.
 *
 * Usage in ChatScreen:
 *   const { canChat, requireChat, deductChat } = useWallet();
 *
 *   Before sending a message:
 *     if (!requireChat()) return;   // shows paywall if 0 credits
 *     deductChat();                 // optimistic deduction
 *     await apiService.askChat(...)
 *     // On error, call refetchWallet() to reconcile
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../api/services';
import { useWalletStore } from '../store/useWalletStore';

const STALE_MS = 60_000; // refetch wallet at most once per minute

export function useWallet() {
  const wallet = useWalletStore((s) => s.wallet);
  const setWallet = useWalletStore((s) => s.setWallet);
  const lastFetched = useWalletStore((s) => s.lastFetched);
  const canChat = useWalletStore((s) => s.canChat);
  const canScan = useWalletStore((s) => s.canScan);
  const deductChatCredit = useWalletStore((s) => s.deductChatCredit);
  const deductScanCredit = useWalletStore((s) => s.deductScanCredit);

  const [chatPaywallVisible, setChatPaywallVisible] = useState(false);
  const [scanPaywallVisible, setScanPaywallVisible] = useState(false);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiService.getWallet(),
    enabled: !lastFetched || Date.now() - lastFetched > STALE_MS,
    gcTime: 0,
  });

  if (walletQuery.data && walletQuery.data !== wallet) {
    setWallet(walletQuery.data);
  }

  /**
   * Call before sending a chat message.
   * Returns true if the user has credits; false + shows paywall otherwise.
   */
  const requireChat = useCallback((): boolean => {
    if (canChat()) return true;
    setChatPaywallVisible(true);
    return false;
  }, [canChat]);

  /**
   * Call before starting an image scan.
   */
  const requireScan = useCallback((): boolean => {
    if (canScan()) return true;
    setScanPaywallVisible(true);
    return false;
  }, [canScan]);

  /**
   * Optimistically deduct 1 chat credit. Server will confirm.
   */
  const deductChat = useCallback(() => {
    deductChatCredit();
  }, [deductChatCredit]);

  /**
   * Optimistically deduct 1 scan credit.
   */
  const deductScan = useCallback(() => {
    deductScanCredit();
  }, [deductScanCredit]);

  /**
   * Refetch wallet from server (e.g. after payment or on error).
   */
  const refetchWallet = useCallback(async () => {
    try {
      const updated = await apiService.getWallet();
      setWallet(updated);
    } catch {
      // ignore
    }
  }, [setWallet]);

  return {
    wallet,
    isLoading: walletQuery.isLoading,

    // Credit checks
    canChat: canChat(),
    canScan: canScan(),

    // Gate methods (show paywall if needed)
    requireChat,
    requireScan,

    // Optimistic deductions
    deductChat,
    deductScan,

    // Paywall visibility state (pass to <PaywallBottomSheet>)
    chatPaywallVisible,
    scanPaywallVisible,
    dismissChatPaywall: () => setChatPaywallVisible(false),
    dismissScanPaywall: () => setScanPaywallVisible(false),

    refetchWallet,
  };
}
