import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { logService, type LogFilters } from "../services/logService";

export const useLogs = (filters: LogFilters) =>
  useQuery({
    queryKey: queryKeys.logs(filters),
    queryFn: () => logService.list(filters)
  });

