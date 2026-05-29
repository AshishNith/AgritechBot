import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { orderService, type OrderFilters } from "../services/orderService";
import type { OrderItem } from "../types/api";

export const useOrders = (filters: OrderFilters) =>
  useQuery({
    queryKey: queryKeys.orders(filters),
    queryFn: () => orderService.list(filters)
  });

export const useOrderDetail = (orderId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.orderDetail(orderId),
    queryFn: () => orderService.getById(orderId),
    enabled: enabled && Boolean(orderId)
  });

export const useOrderMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderItem["status"] }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: (data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: queryKeys.orderDetail(variables.orderId) });
    }
  });

  return { updateStatus };
};
