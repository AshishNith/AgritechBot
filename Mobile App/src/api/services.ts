import { api } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AskChatRequest,
  AskChatResponse,
  FarmingTask,
  ChatContextResponse,
  ChatMessagesResponse,
  AuthResponse,
  ChatHistoryResponse,
  NotificationListResponse,
  OrderListResponse,
  OrderRequest,
  Product,
  ProductDetailResponse,
  ProductListResponse,
  SendOtpResponse,
  SubscriptionStatus,
  SubscriptionTier,
  UserProfile,
  VoiceAskResponse,
  CreatePaymentOrderResponse,
  MarketplacePaymentVerificationResponse,
  WalletUpdateResponse,
  Wallet,
} from '../types/api';
import { RecordedAudioClip } from '../hooks/useAudioRecorder';

const SCAN_HISTORY_STORAGE_KEY = 'anaaj-scan-history-cache';

type ScanHistoryItem = {
  _id: string;
  diagnosis: string;
  status: string;
  createdAt: string;
  imageUri?: string | null;  // Added Cloudinary URL
  thumbnailUrl?: string | null;
  metadata?: {
    language?: string;
    cropType?: string;
  };
};

async function readLocalScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalScanHistory(items: ScanHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(SCAN_HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

async function upsertLocalScanHistory(item: ScanHistoryItem): Promise<void> {
  const current = await readLocalScanHistory();
  const next = [item, ...current.filter((existing) => existing._id !== item._id)];
  await writeLocalScanHistory(next);
}

const mapProduct = (raw: any): Product => ({
  id: String(raw._id ?? raw.id),
  slug: raw.slug,
  brand: raw.brand,
  name: raw.name,
  nameHi: raw.nameHi,
  nameGu: raw.nameGu,
  namePa: raw.namePa,
  description: raw.description,
  descriptionHi: raw.descriptionHi,
  descriptionGu: raw.descriptionGu,
  descriptionPa: raw.descriptionPa,
  category: raw.category,
  categoryHi: raw.categoryHi,
  categoryGu: raw.categoryGu,
  categoryPa: raw.categoryPa,
  subCategory: raw.subCategory,
  subCategoryHi: raw.subCategoryHi,
  subCategoryGu: raw.subCategoryGu,
  subCategoryPa: raw.subCategoryPa,
  farmerFriendlyInfo: raw.farmerFriendlyInfo,
  pricing: raw.pricing ? {
    ...raw.pricing,
    unitHi: raw.pricing.unitHi,
    unitGu: raw.pricing.unitGu,
    unitPa: raw.pricing.unitPa,
  } : undefined,
  price: raw.pricing?.discountPrice ?? raw.pricing?.price ?? raw.price,
  unit: raw.pricing?.unit ?? raw.unit,
  unitHi: raw.pricing?.unitHi ?? raw.unitHi,
  unitGu: raw.pricing?.unitGu ?? raw.unitGu,
  unitPa: raw.pricing?.unitPa ?? raw.unitPa,
  images: raw.images ?? [],
  ratings: raw.ratings,
  reviews: (raw.reviews ?? []).map((review: any) => ({
    ...review,
    date: new Date(review.date).toISOString(),
  })),
  inventory: raw.inventory ? {
    ...raw.inventory,
    deliveryTimeHi: raw.inventory.deliveryTimeHi,
    deliveryTimeGu: raw.inventory.deliveryTimeGu,
    deliveryTimePa: raw.inventory.deliveryTimePa,
  } : undefined,
  aiMetadata: raw.aiMetadata,
  seller: raw.seller,
  inStock: raw.inventory?.available ?? raw.inStock,
  quantity: raw.pricing?.stock ?? raw.quantity,
});

export const apiService = {
  async sendOtp(phone: string) {
    const { data } = await api.post<SendOtpResponse>('/api/auth/send-otp', { phone });
    return data;
  },
  async verifyOtp(phone: string, otp: string) {
    const { data } = await api.post<AuthResponse>('/api/auth/verify-otp', { phone, otp });
    return data;
  },
  async getProfile() {
    const { data } = await api.get<{ user: UserProfile }>('/api/user/profile');
    return data.user;
  },
  async createProfile(profileData: {
    name: string;
    language?: string;
    location?: {
      state: string;
      district: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    crops?: string[];
    landSize?: number;
    landUnit?: string;
  }) {
    const { data } = await api.post<{ message: string; user: UserProfile }>('/api/user/profile', profileData);
    return data;
  },
  async updateProfile(profileData: Partial<{
    name: string;
    language: string;
    location: {
      state: string;
      district: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    crops: string[];
    landSize: number;
    landUnit: string;
  }>) {
    const { data } = await api.put<{ message: string; user: UserProfile }>('/api/user/profile', profileData);
    return data;
  },
  async getWallet() {
    const { data } = await api.get<{ wallet: Wallet }>('/api/user/wallet');
    return data.wallet;
  },
  async createOrderPayment(payload: OrderRequest) {
    const { data } = await api.post<CreatePaymentOrderResponse>('/api/payment/marketplace-order', {
      items: payload.items,
      deliveryAddress: payload.deliveryAddress,
    });
    return data;
  },
  async createDirectOrder(payload: OrderRequest) {
    const { data } = await api.post<{ order: { _id?: string; id?: string } }>('/api/orders', {
      items: payload.items,
      deliveryAddress: payload.deliveryAddress,
    });
    return data;
  },
  async createSubscriptionOrder(tier: Exclude<SubscriptionTier, 'free'>) {
    const { data } = await api.post<CreatePaymentOrderResponse>('/api/payment/subscription-order', {
      tier,
    });
    return data;
  },
  async createTopupOrder(packId: 'chat_10' | 'chat_25' | 'chat_60' | 'scan_1' | 'scan_3' | 'scan_10') {
    const { data } = await api.post<
      CreatePaymentOrderResponse & {
        packId: string;
        packType: 'chat' | 'scan';
        credits: number;
      }
    >('/api/payment/topup-order', { packId });
    return data;
  },
  async verifyWalletPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    purpose: 'subscription' | 'topup';
    tier?: 'basic' | 'pro';
    packId?: 'chat_10' | 'chat_25' | 'chat_60' | 'scan_1' | 'scan_3' | 'scan_10';
  }) {
    const { data } = await api.post<WalletUpdateResponse>('/api/payment/verify', payload);
    return data;
  },
  async verifyMarketplacePayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { data } = await api.post<MarketplacePaymentVerificationResponse>('/api/payment/verify', {
      ...payload,
      purpose: 'marketplace',
    });
    return data;
  },
  async askChat(payload: AskChatRequest) {
    let sessionId = payload.chatId;

    if (!sessionId) {
      const { data: session } = await api.post<{ sessionId: string; title: string; createdAt: string }>(
        '/api/v1/chat/sessions'
      );
      sessionId = session.sessionId;
    }

    const { data } = await api.post<{
      messageId: string;
      response: string;
      tokensUsed: number;
      processingTime: number;
      modelVersion: string;
      cacheHit: boolean;
      audioBase64?: string;
      audioMimeType?: string;
    }>(`/api/v1/chat/sessions/${sessionId}/message`, {
      text: payload.message,
      language: payload.language,
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
    });

    return {
      answer: data.response,
      chatId: sessionId,
      cached: data.cacheHit,
      model: data.modelVersion,
      mode: 'session-v1',
      audioBase64: data.audioBase64,
      audioMimeType: data.audioMimeType,
      idempotencyKey: (data as any).idempotencyKey,
      wallet: (data as any).wallet,
      quickReplies: [],
      recommendedProducts: [],
    } satisfies AskChatResponse;
  },
  async createChatSession() {
    const { data } = await api.post<{ sessionId: string; title: string; createdAt: string }>(
      '/api/v1/chat/sessions'
    );
    return {
      chatId: data.sessionId,
      title: data.title,
      createdAt: data.createdAt,
    };
  },
  async renameChatSession(chatId: string, title: string) {
    const { data } = await api.put<{ sessionId: string; title: string; updatedAt: string }>(
      `/api/v1/chat/sessions/${chatId}`,
      { title }
    );
    return data;
  },
  async archiveChatSession(chatId: string) {
    const { data } = await api.delete<{ message: string }>(`/api/v1/chat/sessions/${chatId}`);
    return data;
  },
  async clearChatHistory(chatId: string) {
    const { data } = await api.delete<{ message: string }>(`/api/v1/chat/sessions/${chatId}/history`);
    return data;
  },
  async getChatHistory() {
    const { data } = await api.get<{
      sessions: Array<{
        sessionId: string;
        title: string;
        messageCount: number;
        updatedAt: string;
        lastMessageAt: string;
        preview?: string;
        status?: 'active' | 'archived';
        metadata?: {
          location?: string;
          season?: string;
          cropsDiscussed?: string[];
          problemsSolved?: string[];
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>('/api/v1/chat/sessions');
    return {
      pagination: data.pagination,
      chats: data.sessions.map((chat) => ({
        id: String(chat.sessionId),
        title: chat.title,
        language: chat.metadata?.location || chat.metadata?.season || 'Anaaj.ai chat',
        messageCount: chat.messageCount,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.lastMessageAt,
        preview: chat.preview,
        status: chat.status,
        metadata: chat.metadata,
      })),
    } satisfies ChatHistoryResponse;
  },
  async getChatMessages(chatId: string) {
    const { data } = await api.get<{
      sessionId: string;
      messages: Array<{
        _id: string;
        role: 'user' | 'assistant' | 'system';
        content: {
          text?: string;
          type?: 'text' | 'image' | 'tool_call' | 'tool_result';
        };
        metadata?: {
          language?: 'hi' | 'en' | 'gu' | 'pa';
          audioBase64?: string;
          audioMimeType?: string;
          voiceInput?: boolean;
        };
        error?: {
          code?: string;
          message: string;
        };
        createdAt?: string;
      }>;
    }>(`/api/v1/chat/sessions/${chatId}/messages`);
    return {
      chatId: data.sessionId,
      messages: data.messages
        .filter((msg) => {
          // Filter out system messages and tool interaction messages
          if (msg.role === 'system') return false;
          const contentType = msg.content?.type;
          if (contentType === 'tool_call' || contentType === 'tool_result') return false;
          return true;
        })
        .map((msg) => ({
          id: String(msg._id),
          chatId: String(data.sessionId),
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: typeof msg.content === 'string' ? msg.content : (msg.content as any)?.text || '',
          language:
            msg.metadata?.language === 'hi'
              ? 'Hindi'
              : msg.metadata?.language === 'gu'
                ? 'Gujarati'
                : msg.metadata?.language === 'pa'
                  ? 'Punjabi'
                  : 'English',
          audioUrl: msg.metadata?.audioBase64
            ? `data:${msg.metadata.audioMimeType || 'audio/mp3'};base64,${msg.metadata.audioBase64}`
            : undefined,
          audioMimeType: msg.metadata?.audioMimeType,
          voiceInput: msg.metadata?.voiceInput,
          type: msg.content?.type,
          error: msg.error,
          createdAt: msg.createdAt,
        })),
    } satisfies ChatMessagesResponse;
  },
  async getChatContext() {
    const { data } = await api.get<ChatContextResponse>('/api/v1/chat/context');
    return data;
  },
  async getProducts(search?: string, category?: string) {
    const { data } = await api.get<ProductListResponse>('/api/products', {
      params: { search, category },
    });

    return {
      ...data,
      products: data.products.map(mapProduct),
    } satisfies ProductListResponse;
  },
  async getProduct(id: string) {
    const { data } = await api.get<ProductDetailResponse>(`/api/products/${id}`);
    return {
      product: mapProduct(data.product),
    } satisfies ProductDetailResponse;
  },
  async getOrders() {
    const { data } = await api.get<OrderListResponse>('/api/orders');
    return {
      ...data,
      orders: data.orders.map((order: any) => ({
        ...order,
        id: String(order._id ?? order.id),
      })),
    } satisfies OrderListResponse;
  },
  async sendVoice(audioClip: RecordedAudioClip, language: string) {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<VoiceAskResponse & { audio?: string; text?: string }>(
      '/api/voice/ask',
      formData,
      {
        timeout: 90000,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return {
      ...data,
      transcript: data.transcript ?? data.text,
      audioBase64: data.audioBase64 ?? data.audio,
    } satisfies VoiceAskResponse;
  },
  async sendVoiceMessage(audioClip: RecordedAudioClip, language: string, chatId?: string) {
    let sessionId = chatId;

    if (!sessionId) {
      const created = await this.createChatSession();
      sessionId = created.chatId;
    }

    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<VoiceAskResponse & { audio?: string; text?: string }>(
      `/api/v1/chat/sessions/${sessionId}/voice`,
      formData,
      {
        timeout: 90000,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return {
      ...data,
      chatId: sessionId,
      transcript: data.transcript ?? data.text,
      audioBase64: data.audioBase64 ?? data.audio,
    } satisfies VoiceAskResponse;
  },

  /**
   * STT-only: transcribe audio and return the text.
   * No AI call, no TTS. Use this to auto-fill the chat input box.
   */
  async transcribeVoice(audioClip: RecordedAudioClip, language: string): Promise<{ transcript: string; language: string }> {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<{ transcript: string; language: string }>(
      '/api/v1/chat/voice-input',
      formData,
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return data;
  },

  /**
   * Dummy upgrade for testing (no payments)
   */
  async testUpgradeSubscription(tier: 'basic' | 'premium') {
    const { data } = await api.post<{ message: string; subscription: any }>('/api/subscription/test-upgrade', {
      tier,
    });
    return data;
  },

  /**
   * Process a dummy payment for subscription upgrade
   */
  async processDummyPayment(tier: 'basic' | 'premium') {
    const { data } = await api.post<{ success: boolean; subscriptionTier: string; expiresAt: string; wallet?: Wallet }>('/api/user/subscription/dummy-payment', { tier });
    return data;
  },

  // ── Notifications ──
  async getNotifications(type?: string) {
    const { data } = await api.get<NotificationListResponse>('/api/notifications', {
      params: type ? { type } : undefined,
    });
    return data;
  },
  async getUnreadCount() {
    const { data } = await api.get<{ unreadCount: number }>('/api/notifications/unread-count');
    return data;
  },
  async markNotificationRead(id: string) {
    const { data } = await api.put(`/api/notifications/${id}/read`);
    return data;
  },
  async markAllNotificationsRead() {
    const { data } = await api.put('/api/notifications/read-all');
    return data;
  },

  // ── Image Analysis ──
  async analyzeCrop(imageBase64: string, imageMimeType: string, language?: string) {
    const { data } = await api.post<{
      id: string;
      diagnosis: string;
      createdAt: string;
      wallet?: Wallet;
    }>('/api/v1/image-analysis/analyze', {
      imageBase64,
      imageMimeType,
      language,
    });

    return data;
  },
  async saveLocalScanHistoryEntry(item: ScanHistoryItem) {
    await upsertLocalScanHistory(item);
  },
  async getScanHistory() {
    try {
      const { data } = await api.get<{
        history: ScanHistoryItem[];
      }>('/api/v1/image-analysis/history');
      return data.history || [];
    } catch {
      return [];
    }
  },

  // ── Farming Assistant ──
  async addCrop(cropData: {
    cropType: string;
    variety?: string;
    plantingDate: Date;
    landSize?: number;
    landUnit?: string;
    soilType?: string;
    currentStage: string;
    location: { latitude: number; longitude: number; address?: string };
  }) {
    const { data } = await api.post<{ message: string; crop: any; taskCount: number }>(
      '/api/v1/farming-assistant/crops',
      cropData
    );
    return data;
  },
  async getCrops() {
    const { data } = await api.get<{ crops: any[] }>('/api/v1/farming-assistant/crops');
    return data.crops;
  },
  async getTasks(filters?: {
    cropId?: string;
    start?: string;
    end?: string;
    status?: 'pending' | 'completed' | 'skipped' | 'missed';
    taskType?: 'watering' | 'fertilizing' | 'pesticide' | 'weeding' | 'harvesting' | 'maintenance';
    priority?: 'low' | 'medium' | 'high';
  }) {
    const { data } = await api.get<{ tasks: FarmingTask[] }>('/api/v1/farming-assistant/tasks', {
      params: filters,
    });
    return data.tasks;
  },
  async updateTask(
    taskId: string,
    payload: Partial<{
      status: 'pending' | 'completed' | 'skipped' | 'missed';
      title: string;
      description: string;
      scheduledDate: string;
      priority: 'low' | 'medium' | 'high';
      reminderMinutesBefore: number;
      repeat: 'none' | 'daily' | 'weekly';
    }>
  ) {
    const { data } = await api.patch<{ message: string; task: FarmingTask }>(
      `/api/v1/farming-assistant/tasks/${taskId}`,
      payload
    );
    return data;
  },
  async updateTaskStatus(taskId: string, status: 'pending' | 'completed' | 'skipped' | 'missed') {
    return this.updateTask(taskId, { status });
  },
  async getCropWeather(cropId: string) {
    const { data } = await api.get<{ weather: any }>('/api/v1/farming-assistant/weather', {
      params: { cropId },
    });
    return data.weather;
  },

  // ── AI Crop Planner (New System) ──
  async generateCropPlan(input: any) {
    const { data } = await api.post('/api/v1/crop-planner/generate-plan', input);
    return data;
  },
  async getCropPlans() {
    const { data } = await api.get('/api/v1/crop-planner/plans');
    return data;
  },
  async getCropPlanById(id: string) {
    const { data } = await api.get(`/api/v1/crop-planner/plans/${id}`);
    return data;
  },
  
  // Generic helper for ad-hoc calls
  async get(url: string, config?: any) {
    const { data } = await api.get(url, config);
    return data;
  },
  async post(url: string, body?: any, config?: any) {
    const { data } = await api.post(url, body, config);
    return data;
  }
};
