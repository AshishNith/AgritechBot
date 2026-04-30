import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { analyticsService } from "../services/analyticsService";

export const useAnalytics = () =>
  useQuery({
    queryKey: queryKeys.analytics,
    queryFn: analyticsService.get
  });

