import { useMutation } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import type { NotificationPayload } from "../types/api";

export const useSendNotification = () =>
  useMutation({
    mutationFn: (payload: NotificationPayload) => notificationService.send(payload)
  });

