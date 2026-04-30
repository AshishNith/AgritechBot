export const queryKeys = {
  authMe: ["auth", "me"] as const,
  dashboardOverview: ["dashboard", "overview"] as const,
  users: (params: Record<string, unknown>) => ["users", params] as const,
  userDetail: (id: string) => ["users", "detail", id] as const,
  crops: (params: Record<string, unknown>) => ["crops", params] as const,
  plans: (params: Record<string, unknown>) => ["plans", params] as const,
  analytics: ["analytics"] as const,
  logs: (params: Record<string, unknown>) => ["logs", params] as const
};

