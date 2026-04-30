import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { planService, type PlanFilters } from "../services/planService";

export const usePlans = (filters: PlanFilters) =>
  useQuery({
    queryKey: queryKeys.plans(filters),
    queryFn: () => planService.list(filters)
  });

export const usePlanMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["plans"] });

  const feedback = useMutation({
    mutationFn: ({ planId, feedback }: { planId: string; feedback: "good" | "bad" }) =>
      planService.feedback(planId, feedback),
    onSuccess: invalidate
  });

  const regenerate = useMutation({
    mutationFn: (planId: string) => planService.regenerate(planId),
    onSuccess: invalidate
  });

  return { feedback, regenerate };
};

