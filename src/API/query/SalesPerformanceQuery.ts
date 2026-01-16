// React Query hooks for analytics data
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { KPIData } from "@/Types/Analytics.types";
import { SalesPerformanceService } from "@/API/Services/SalesPerformanceService";


// Query keys
export const salesPerformanceKeys = {
  all: ["salesPerformance"] as const,
  kpi: (period: string) => [...salesPerformanceKeys.all, "kpi", period] as const,
  
};

// KPI summary query
export const useKPIQuery = (
  period: string,
  options?: Omit<UseQueryOptions<KPIData, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: salesPerformanceKeys.kpi(period),
    queryFn: () => SalesPerformanceService.getKPISummary(period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};


