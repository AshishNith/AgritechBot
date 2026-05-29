import { apiClient } from "./apiClient";
import type { PaginatedResponse, ProductItem, ProductPayload } from "../types/api";

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  stockStatus?: "all" | "inStock" | "outOfStock";
}

export const productService = {
  async list(filters: ProductFilters): Promise<PaginatedResponse<ProductItem>> {
    const { data } = await apiClient.get<PaginatedResponse<ProductItem>>("/admin/products", { params: filters });
    return data;
  },

  async get(productId: string): Promise<ProductItem> {
    const { data } = await apiClient.get<ProductItem>(`/admin/products/${productId}`);
    return data;
  },

  async create(payload: ProductPayload): Promise<{ product: ProductItem; message: string }> {
    const { data } = await apiClient.post<{ product: ProductItem; message: string }>("/admin/products", payload);
    return data;
  },

  async update(productId: string, payload: ProductPayload): Promise<{ product: ProductItem; message: string }> {
    const { data } = await apiClient.put<{ product: ProductItem; message: string }>(`/admin/products/${productId}`, payload);
    return data;
  },

  async delete(productId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/admin/products/${productId}`);
    return data;
  }
};
