import { apiClient } from "./apiClient";
import type { PaginatedResponse, PlanListItem } from "../types/api";

export interface PlanFilters {
  page: number;
  limit: number;
  crop?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export const planService = {
  async list(filters: PlanFilters): Promise<PaginatedResponse<PlanListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<PlanListItem>>("/admin/plans", { params: filters });
    return data;
  },

  async feedback(planId: string, feedback: "good" | "bad"): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>(`/admin/plans/${planId}/feedback`, { feedback });
    return data;
  },

  async regenerate(planId: string): Promise<{ message: string; plan: PlanListItem }> {
    const { data } = await apiClient.post<{ message: string; plan: PlanListItem }>(
      `/admin/plans/${planId}/regenerate`
    );
    return data;
  }
};

