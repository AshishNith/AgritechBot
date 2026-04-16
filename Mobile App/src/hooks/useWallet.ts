/**
 * useWallet — convenience hook for consuming wallet state in screens.
 *
 * Usage in ChatScreen:
 *   const { canChat, requireChat } = useWallet();
 *
 *   Before sending a message:
 *     if (!requireChat()) return;   // shows paywall if 0 credits
 *     await apiService.askChat(...)
 *     // Credits are deducted on server side
 *
 * Note: Optimistic deduction has been removed to prevent double deduction.
 * All credit management is now handled entirely by the backend.
 */

import { useCallback, useEffect } from 'react';
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

  const chatPaywallVisible = useWalletStore((s) => s.chatPaywallVisible);
  const scanPaywallVisible = useWalletStore((s) => s.scanPaywallVisible);
  const setChatPaywallVisible = useWalletStore((s) => s.setChatPaywallVisible);
  const setScanPaywallVisible = useWalletStore((s) => s.setScanPaywallVisible);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiService.getWallet(),
    // Fetch if we don't have a wallet, OR if it's been more than STALE_MS since last fetch
    enabled: !wallet || !lastFetched || Date.now() - lastFetched > STALE_MS,
    gcTime: 0,
  });

  useEffect(() => {
    if (walletQuery.data && walletQuery.data !== wallet) {
      setWallet(walletQuery.data);
    }
  }, [walletQuery.data, wallet, setWallet]);

  /**
   * Call before sending a chat message.
   * Returns true if the user has credits; false + shows paywall otherwise.
   */
  const requireChat = useCallback((force = false): boolean => {
    // If wallet exists and we can chat, allow it
    if (!force && wallet && canChat()) return true;
    
    // If no wallet data yet and still loading, allow trying — server will return 402 if actually 0
    if (!force && !wallet && (walletQuery.isLoading || walletQuery.isPending)) return true;
    
    // Show paywall if we have wallet data and no credits, or if forced
    setChatPaywallVisible(true);
    return false;
  }, [wallet, canChat, walletQuery.isLoading, walletQuery.isPending, setChatPaywallVisible]);

  /**
   * Call before starting an image scan.
   */
  const requireScan = useCallback((force = false): boolean => {
    // If wallet exists and we can scan, allow it
    if (!force && wallet && canScan()) return true;
    
    // If no wallet data yet and still loading, allow trying — server will return 402 if actually 0
    if (!force && !wallet && (walletQuery.isLoading || walletQuery.isPending)) return true;
    
    // Show paywall if we have wallet data and no credits, or if forced
    setScanPaywallVisible(true);
    return false;
  }, [wallet, canScan, walletQuery.isLoading, walletQuery.isPending, setScanPaywallVisible]);

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
    isLoading: walletQuery.isLoading || walletQuery.isPending,
    isError: walletQuery.isError,
    isRefetching: walletQuery.isRefetching,

    // Credit checks
    canChat: canChat(),
    canScan: canScan(),

    // Gate methods (show paywall if needed)
    requireChat,
    requireScan,

    // Paywall visibility state (pass to <PaywallBottomSheet>)
    chatPaywallVisible,
    scanPaywallVisible,
    dismissChatPaywall: () => setChatPaywallVisible(false),
    dismissScanPaywall: () => setScanPaywallVisible(false),

    refetchWallet,
  };
}
