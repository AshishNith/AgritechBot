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

