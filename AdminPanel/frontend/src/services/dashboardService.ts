import { apiClient } from "./apiClient";
import type { DashboardOverviewResponse } from "../types/api";

export const dashboardService = {
  async getOverview(): Promise<DashboardOverviewResponse> {
    const { data } = await apiClient.get<DashboardOverviewResponse>("/admin/dashboard/overview");
    return data;
  }
};

