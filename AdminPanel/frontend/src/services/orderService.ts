import { apiClient } from "./apiClient";
import type { PaginatedResponse, OrderItem } from "../types/api";

export interface OrderFilters {
  page: number;
  limit: number;
  status?: "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  search?: string;
}

export const orderService = {
  async list(filters: OrderFilters): Promise<PaginatedResponse<OrderItem>> {
    const { data } = await apiClient.get<PaginatedResponse<OrderItem>>("/admin/orders", { params: filters });
    return data;
  },

  async getById(orderId: string): Promise<{ order: OrderItem }> {
    const { data } = await apiClient.get<{ order: OrderItem }>(`/admin/orders/${orderId}`);
    return data;
  },

  async updateStatus(orderId: string, status: OrderItem["status"]): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>(`/admin/orders/${orderId}/status`, { status });
    return data;
  }
};
