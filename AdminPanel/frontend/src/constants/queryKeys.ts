export const queryKeys = {
  authMe: ["auth", "me"] as const,
  dashboardOverview: ["dashboard", "overview"] as const,
  users: (params: any) => ["users", params] as const,
  userDetail: (id: string) => ["users", "detail", id] as const,
  crops: (params: any) => ["crops", params] as const,
  plans: (params: any) => ["plans", params] as const,
  analytics: ["analytics"] as const,
  logs: (params: any) => ["logs", params] as const,
  products: (params: any) => ["products", params] as const,
  productDetail: (id: string) => ["products", "detail", id] as const,
  orders: (params: any) => ["orders", params] as const,
  orderDetail: (id: string) => ["orders", "detail", id] as const
};

