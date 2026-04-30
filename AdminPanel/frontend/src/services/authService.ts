import { apiClient } from "./apiClient";
import type { AdminProfile, LoginPayload, LoginResponse } from "../types/api";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/admin-auth/login", payload);
    return data;
  },

  async me(): Promise<{ admin: AdminProfile }> {
    const { data } = await apiClient.get<{ admin: AdminProfile }>("/admin-auth/me");
    return data;
  }
};

