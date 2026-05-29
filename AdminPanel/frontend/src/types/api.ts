export type AdminRole = "admin" | "super_admin";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminProfile;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalPlans: number;
  popularCrops: Array<{ crop: string; count: number }>;
  apiUsage: {
    requests: number;
    tokens: number;
  };
  errorRate: number;
}

export interface OverviewCharts {
  userGrowth: Array<{ date: string; count: number }>;
  cropUsage: Array<{ crop: string; count: number }>;
}

export interface DashboardOverviewResponse {
  metrics: OverviewMetrics;
  charts: OverviewCharts;
}

export interface UserListItem {
  id: string;
  name: string;
  phone: string;
  location: string;
  crops: string[];
  status: "active" | "blocked";
  lastActiveAt: string;
  plansGenerated: number;
  createdAt: string;
}

export interface UserProfile extends UserListItem {
  district?: string;
  state?: string;
}

export interface CropItem {
  id: string;
  name: string;
  soilType: string;
  climate: string;
  growthStages: string[];
  schedule: string[];
  createdAt: string;
}

export interface CropPayload {
  name: string;
  soilType: string;
  climate: string;
  growthStages: string[];
  schedule: string[];
}

export interface PlanListItem {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  crop: string;
  prompt: string;
  response: string;
  feedback: "good" | "bad" | "unrated";
  tokenUsage: number;
  createdAt: string;
}

export interface AnalyticsResponse {
  dailyActiveUsers: Array<{ date: string; count: number }>;
  planGenerationTrends: Array<{ date: string; count: number }>;
  tokenUsagePerDay: Array<{ date: string; count: number }>;
  funnel: Array<{ stage: string; count: number; conversionRate: number }>;
}

export interface NotificationPayload {
  title: string;
  message: string;
  target: {
    location?: string;
    crop?: string;
    broadcast?: boolean;
  };
}

export interface NotificationResult {
  sentCount: number;
  recipients: Array<{ id: string; name: string; location: string }>;
}

export interface LogItem {
  id: string;
  type: "api" | "error" | "ai_failure" | "notification" | "system";
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  nameHi: string;
  nameGu: string;
  namePa: string;
  description: string;
  descriptionHi: string;
  descriptionGu: string;
  descriptionPa: string;
  category: string;
  categoryHi: string;
  categoryGu: string;
  categoryPa: string;
  subCategory: string;
  subCategoryHi: string;
  subCategoryGu: string;
  subCategoryPa: string;
  price: number;
  unit: string;
  unitHi: string;
  unitGu: string;
  unitPa: string;
  images: string[];
  inStock: boolean;
  quantity: number;
  seller: {
    name: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
  createdAt: string;
}

export interface ProductPayload {
  name: string;
  brand?: string;
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
  price: number;
  unit: string;
  unitHi?: string;
  unitGu?: string;
  unitPa?: string;
  images?: string[];
  inStock?: boolean;
  quantity?: number;
  seller: {
    name: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
}

export interface OrderItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt?: string;
}

