export type RootStackParamList = {
  Splash: undefined;
  LanguageOnboarding: undefined;
  VoiceIntro: undefined;
  CropIntro: undefined;
  Login: undefined;
  Otp: { phone: string };
  ProfileSetup: undefined;
  ProfileCompletion: undefined;
  ProfileComplete: undefined;
  MainTabs: undefined;
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

export type MainTabParamList = {
  HomeTab: undefined;
  ChatTab: undefined;
  MarketplaceTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};
