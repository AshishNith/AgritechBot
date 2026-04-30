import { apiClient } from "./apiClient";
import type { CropItem, CropPayload, PaginatedResponse } from "../types/api";

export interface CropFilters {
  page: number;
  limit: number;
  search?: string;
}

export const cropService = {
  async list(filters: CropFilters): Promise<PaginatedResponse<CropItem>> {
    const { data } = await apiClient.get<PaginatedResponse<CropItem>>("/admin/crops", { params: filters });
    return data;
  },

  async create(payload: CropPayload): Promise<{ crop: CropItem; message: string }> {
    const { data } = await apiClient.post<{ crop: CropItem; message: string }>("/admin/crops", payload);
    return data;
  },

  async update(cropId: string, payload: CropPayload): Promise<{ crop: CropItem; message: string }> {
    const { data } = await apiClient.put<{ crop: CropItem; message: string }>(`/admin/crops/${cropId}`, payload);
    return data;
  },

  async delete(cropId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/admin/crops/${cropId}`);
    return data;
  }
};

