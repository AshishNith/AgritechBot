import { apiClient } from "./apiClient";
import type { LogItem, PaginatedResponse } from "../types/api";

export interface LogFilters {
  page: number;
  limit: number;
  type?: "api" | "error" | "ai_failure" | "notification" | "system";
}

export const logService = {
  async list(filters: LogFilters): Promise<PaginatedResponse<LogItem>> {
    const { data } = await apiClient.get<PaginatedResponse<LogItem>>("/admin/logs", { params: filters });
    return data;
  }
};

