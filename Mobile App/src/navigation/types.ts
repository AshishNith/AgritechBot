import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  ChatTab: { chatId?: string } | undefined;
  MarketplaceTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  LanguageOnboarding: undefined;
  VoiceIntro: undefined;
  CropIntro: undefined;
  Login: undefined;
  Otp: { phone: string; otpPreview?: string | null };
  ProfileSetup: undefined;
  ProfileCompletion: undefined;
  ProfileComplete: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Marketplace: undefined;
  ProductDetail: { productId?: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  OrderHistory: undefined;
  Subscription: undefined;
  Voice: undefined;
  ImageScan: undefined;
  Notifications: undefined;
};
