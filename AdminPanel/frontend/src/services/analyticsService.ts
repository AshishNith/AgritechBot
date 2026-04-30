import { apiClient } from "./apiClient";
import type { AnalyticsResponse } from "../types/api";

export const analyticsService = {
  async get(): Promise<AnalyticsResponse> {
    const { data } = await apiClient.get<AnalyticsResponse>("/admin/analytics");
    return data;
  }
};

