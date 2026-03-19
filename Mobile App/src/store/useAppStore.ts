import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppLanguage, Product, UserProfile } from '../types/api';

interface AppState {
  token: string | null;
  user: UserProfile | null;
  language: AppLanguage;
  phoneDraft: string;
  pendingOtp: string | null;
  hasCompletedOnboarding: boolean;
  selectedCrops: string[];
  featuredProduct: Product | null;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLanguage: (language: AppLanguage) => void;
  setPhoneDraft: (phone: string) => void;
  setPendingOtp: (otp: string | null) => void;
  completeOnboarding: () => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSelectedCrops: (crops: string[]) => void;
  setFeaturedProduct: (product: Product | null) => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Partial<AppState>>(
    (set) => ({
      token: null,
      user: null,
      language: 'English',
      phoneDraft: '+91',
      pendingOtp: null,
      hasCompletedOnboarding: false,
      selectedCrops: ['गेहूं'],
      featuredProduct: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setPhoneDraft: (phoneDraft) => set({ phoneDraft }),
      setPendingOtp: (pendingOtp) => set({ pendingOtp }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
      setFeaturedProduct: (featuredProduct) => set({ featuredProduct }),
      signOut: () =>
        set({
          token: null,
          user: null,
          pendingOtp: null,
          hasCompletedOnboarding: false,
          phoneDraft: '+91',
          featuredProduct: null,
          selectedCrops: ['गेहूं'],
        }),
    }),
    {
      name: 'anaaj-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        language: state.language,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
