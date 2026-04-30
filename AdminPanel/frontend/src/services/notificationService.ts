import { apiClient } from "./apiClient";
import type { NotificationPayload, NotificationResult } from "../types/api";

export const notificationService = {
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const { data } = await apiClient.post<NotificationResult>("/admin/notifications/send", payload);
    return data;
  }
};

