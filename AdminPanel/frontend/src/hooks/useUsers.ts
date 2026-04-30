import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { userService, type UserFilters } from "../services/userService";

export const useUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => userService.list(filters)
  });

export const useUserDetail = (userId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.userDetail(userId),
    queryFn: () => userService.getById(userId),
    enabled: enabled && Boolean(userId)
  });

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const updateStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "blocked" }) =>
      userService.updateStatus(userId, status),
    onSuccess: invalidateUsers
  });

  const removeUser = useMutation({
    mutationFn: (userId: string) => userService.delete(userId),
    onSuccess: invalidateUsers
  });

  return { updateStatus, removeUser };
};

