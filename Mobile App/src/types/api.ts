export type AppLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Punjabi';

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  role?: string;
  language?: string;
  location?: {
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  crops?: string[];
  landSize?: number;
  landUnit?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export interface SendOtpResponse {
  message: string;
  otp?: string;
  expiresInSeconds: number;
}

export interface Product {
  id: string;
  slug?: string;
  brand?: string;
  name: string;
  nameHi?: string;
  nameGu?: string;
  namePa?: string;
  description: string;
  descriptionHi?: string;
  descriptionGu?: string;
  descriptionPa?: string;
  category: string;
  categoryHi?: string;
  categoryGu?: string;
  categoryPa?: string;
  subCategory?: string;
  subCategoryHi?: string;
  subCategoryGu?: string;
  subCategoryPa?: string;
  farmerFriendlyInfo?: {
    whyUse?: string;
    whyUseHi?: string;
    whyUseGu?: string;
    whyUsePa?: string;
    howToUse?: string;
    howToUseHi?: string;
    howToUseGu?: string;
    howToUsePa?: string;
    bestForCrops?: string[];
    resultTime?: string;
    resultTimeHi?: string;
    resultTimeGu?: string;
    resultTimePa?: string;
    safety?: string;
    safetyHi?: string;
    safetyGu?: string;
    safetyPa?: string;
  };
  pricing?: {
    price: number;
    discountPrice?: number;
    currency?: string;
    unit?: string;
    unitHi?: string;
    unitGu?: string;
    unitPa?: string;
    stock?: number;
    minOrderQty?: number;
  };
  price: number;
  unit: string;
  unitHi?: string;
  unitGu?: string;
  unitPa?: string;
  images: string[];
  ratings?: {
    average?: number;
    count?: number;
  };
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  inventory?: {
    available?: boolean;
    warehouseLocation?: string;
    deliveryTime?: string;
    deliveryTimeHi?: string;
    deliveryTimeGu?: string;
    deliveryTimePa?: string;
  };
  aiMetadata?: {
    tags?: string[];
    useCases?: string[];
    recommendedWith?: string[];
    season?: string[];
    soilType?: string[];
  };
  seller: {
    name: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
  inStock: boolean;
  quantity: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  audioMimeType?: string;
  voiceInput?: boolean;
  createdAt?: string;
  content: string;
  audioUrl?: string;
  type?: 'text' | 'image' | 'tool_call' | 'tool_result';
  metadata?: {
    toolName?: string;
    toolInput?: any;
    toolOutput?: any;
    audioBase64?: string;
    recommendedProducts?: Product[];
  };
  error?: {
    code?: string;
    message: string;
  };
}

export interface AskChatRequest {
  message: string;
  language?: string;
  chatId?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface AskChatResponse {
  answer: string;
  chatId: string;
  cached?: boolean;
  audioUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  quickReplies?: string[];
  recommendedProducts?: Product[];
  model?: string;
  mode?: string;
  idempotencyKey?: string;
  wallet?: Wallet;
}

export interface ChatSummary {
  id: string;
  title: string;
  language: string;
  messageCount: number;
  updatedAt: string;
  lastMessageAt?: string;
  preview?: string;
  status?: 'active' | 'archived';
  metadata?: {
    cropsDiscussed?: string[];
    problemsSolved?: string[];
    location?: string;
    season?: string;
  };
}

export interface ChatHistoryResponse {
  chats: ChatSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  chatId: string;
}

export interface ChatContextResponse {
  contextString: string;
  season: string;
  location: string;
  version: number;
}

export interface ProductDetailResponse {
  product: Product;
}

export interface OrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingMethod?: 'delivery' | 'pickup';
}

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  chatsUsed: number;
  chatsLimit: number;
  scansUsed: number;
  scansLimit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

// Wallet: tracks plan credits + topup credits separately
export interface Wallet {
  userId: string;
  chatCredits: number;      // plan credits remaining
  imageCredits: number;     // plan scan credits remaining
  topupCredits: number;     // extra topup chat credits (never expire)
  topupImageCredits: number;// extra topup scan credits (never expire)
  plan: SubscriptionTier;
  planExpiry: string | null;
  totalChatsUsed: number;
  totalScansUsed: number;
  lastReset: string | null;
  razorpaySubId: string | null;
}

export interface TopupPack {
  id: string;
  label: string;
  credits: number;
  price: number;
  type: 'chat' | 'scan';
  tag?: string; // e.g. "BEST VALUE"
}

export interface PlanConfig {
  tier: SubscriptionTier;
  name: string;
  nameHi: string;
  price: number;
  chatCredits: number;
  imageCredits: number;
  rollover: boolean;
  topupAllowed: boolean;
  mandiAlerts: boolean;
  popular?: boolean;
}

export interface CreatePaymentOrderResponse {
  orderId: string;       // Razorpay order id
  amount: number;        // in paise
  currency: string;
  keyId: string;         // Razorpay key_id for checkout
  checkoutToken?: string;
  isMock?: boolean;
}

export interface WalletUpdateResponse {
  success: boolean;
  wallet: Wallet;
  message?: string;
}

export interface MarketplacePaymentVerificationResponse {
  success: boolean;
  orderId: string;
}

export interface OrderSummary {
  id: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaymentCheckoutResponse {
  paymentOrderId: string;
  checkoutToken: string;
  checkoutUrl: string;
  provider: 'razorpay';
  providerOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  purpose: 'order' | 'subscription';
  status: 'created';
  metadata?: Record<string, unknown>;
}

export interface PaymentStatusResponse {
  paymentOrderId: string;
  status: 'created' | 'verified' | 'failed' | 'expired';
  purpose: 'order' | 'subscription';
  orderId?: string;
  subscriptionTier?: 'basic' | 'premium';
  verifiedAt?: string;
  error?: string;
}

export interface PaymentVerificationResponse {
  status: 'verified';
  purpose: 'order' | 'subscription';
  orderId?: string;
  subscriptionTier?: 'basic' | 'premium';
}

export interface VoiceAskResponse {
  answer: string;
  transcript?: string;
  text?: string;
  audio?: string;
  audioUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  chatId: string;
  idempotencyKey?: string;
}

export type NotificationType = 'crop_alert' | 'weather' | 'ai_suggestion' | 'order' | 'system' | 'farming_task' | 'adaptive_alert';

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserCrop {
  _id: string;
  userId: string;
  cropType: string;
  variety?: string;
  plantingDate: string;
  landSize?: number;
  landUnit?: string;
  soilType?: string;
  currentStage: 'seedling' | 'growing' | 'flowering' | 'fruiting' | 'harvesting' | 'dormant';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface FarmingTask {
  _id: string;
  userCropId: string;
  userId: string;
  cropType?: string;
  location?: { address?: string };
  taskType: 'watering' | 'fertilizing' | 'pesticide' | 'weeding' | 'harvesting' | 'maintenance';
  title: string;
  description: string;
  scheduledDate: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'skipped' | 'missed';
  aiReason?: string;
  isManual: boolean;
  source?: 'ai' | 'manual' | 'adaptive';
  priority: 'low' | 'medium' | 'high';
  reminderMinutesBefore?: number;
  repeat?: 'none' | 'daily' | 'weekly';
  lastAdaptiveUpdateAt?: string;
}

export interface WeatherAlert {
  event: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
}

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  alerts: WeatherAlert[];
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
