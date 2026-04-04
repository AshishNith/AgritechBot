import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppLanguage, Product, UserProfile, SubscriptionStatus } from '../types/api';

interface AppState {
  token: string | null;
  user: UserProfile | null;
  subscriptionStatus: SubscriptionStatus | null;
  language: AppLanguage;
  phoneDraft: string;
  hasCompletedOnboarding: boolean;
  selectedCrops: string[];
  featuredProduct: Product | null;
  notificationsEnabled: boolean;
  unreadNotificationCount: number;
  hasPlayedGreeting: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  setSubscriptionStatus: (status: SubscriptionStatus | null) => void;
  setLanguage: (language: AppLanguage) => void;
  setPhoneDraft: (phone: string) => void;
  completeOnboarding: () => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSelectedCrops: (crops: string[]) => void;
  setFeaturedProduct: (product: Product | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setUnreadNotificationCount: (count: number) => void;
  setHasPlayedGreeting: (played: boolean) => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Partial<AppState>>(
    (set) => ({
      token: null,
      user: null,
      subscriptionStatus: null,
      language: 'Hindi',
      phoneDraft: '+91',
      hasCompletedOnboarding: false,
      selectedCrops: [],

      featuredProduct: null,
      notificationsEnabled: true,
      unreadNotificationCount: 0,
      hasPlayedGreeting: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setSubscriptionStatus: (subscriptionStatus) => set({ subscriptionStatus }),
      setLanguage: (language) => set({ language }),
      setPhoneDraft: (phoneDraft) => set({ phoneDraft }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
      setFeaturedProduct: (featuredProduct) => set({ featuredProduct }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),
      setHasPlayedGreeting: (hasPlayedGreeting) => set({ hasPlayedGreeting }),
      signOut: () =>
        set((state) => ({
          token: null,
          user: null,
          subscriptionStatus: null,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          phoneDraft: '+91',
          featuredProduct: null,
          selectedCrops: [],
          unreadNotificationCount: 0,
        })),
    }),
    {
      name: 'anaaj-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        language: state.language,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
