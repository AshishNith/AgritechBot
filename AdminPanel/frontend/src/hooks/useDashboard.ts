import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { queryKeys } from "../constants/queryKeys";

export const useDashboardOverview = () =>
  useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: dashboardService.getOverview
  });

