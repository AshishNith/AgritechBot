import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { productService, type ProductFilters } from "../services/productService";
import type { ProductPayload } from "../types/api";

export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => productService.list(filters)
  });

export const useProduct = (productId: string) =>
  useQuery({
    queryKey: queryKeys.productDetail(productId),
    queryFn: () => productService.get(productId),
    enabled: !!productId && productId !== "new"
  });

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const create = useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ProductPayload }) =>
      productService.update(productId, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (productId: string) => productService.delete(productId),
    onSuccess: invalidate
  });

  return { create, update, remove };
};
