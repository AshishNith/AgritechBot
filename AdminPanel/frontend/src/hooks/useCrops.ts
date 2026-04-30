import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { cropService, type CropFilters } from "../services/cropService";
import type { CropPayload } from "../types/api";

export const useCrops = (filters: CropFilters) =>
  useQuery({
    queryKey: queryKeys.crops(filters),
    queryFn: () => cropService.list(filters)
  });

export const useCropMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["crops"] });

  const create = useMutation({
    mutationFn: (payload: CropPayload) => cropService.create(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ cropId, payload }: { cropId: string; payload: CropPayload }) =>
      cropService.update(cropId, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (cropId: string) => cropService.delete(cropId),
    onSuccess: invalidate
  });

  return { create, update, remove };
};

