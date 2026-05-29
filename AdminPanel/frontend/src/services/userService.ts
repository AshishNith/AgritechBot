import { apiClient } from "./apiClient";
import type { PaginatedResponse, UserListItem, UserProfile } from "../types/api";

export interface UserFilters {
  page: number;
  limit: number;
  search?: string;
  location?: string;
  crop?: string;
  activity?: "24h" | "7d" | "inactive" | "blocked";
}

export const userService = {
  async list(filters: UserFilters): Promise<PaginatedResponse<UserListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<UserListItem>>("/admin/users", { params: filters });
    return data;
  },

  async getById(userId: string): Promise<{ user: UserProfile; wallet: any }> {
    const { data } = await apiClient.get<{ user: UserProfile; wallet: any }>(`/admin/users/${userId}`);
    return data;
  },

  async updateWallet(
    userId: string,
    payload: { 
      plan: "free" | "basic" | "pro"; 
      chatCredits: number; 
      imageCredits: number;
      topupCredits?: number;
      topupImageCredits?: number;
    }
  ): Promise<{ message: string }> {
    const { data } = await apiClient.put<{ message: string }>(`/admin/users/${userId}/wallet`, payload);
    return data;
  },

  async updateStatus(userId: string, status: "active" | "blocked"): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>(`/admin/users/${userId}/status`, { status });
    return data;
  },

  async delete(userId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
    return data;
  }
};

