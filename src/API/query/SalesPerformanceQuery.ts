// React Query hooks for sales performance data
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { 
  SalesPerformanceService, 
  KPIFilterPayload, 
  KPIResponse, 
  FilterOptionsResponse 
} from "@/API/Services/SalesPerformanceService";

// Query keys
export const salesPerformanceKeys = {
  all: ["salesPerformance"] as const,
  kpi: (filters: KPIFilterPayload) => [...salesPerformanceKeys.all, "kpi", filters] as const,
  filterOptions: () => [...salesPerformanceKeys.all, "filterOptions"] as const,
};

// KPI summary query
export const useSalesKPIQuery = (
  filters: KPIFilterPayload,
  options?: Omit<UseQueryOptions<KPIResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: salesPerformanceKeys.kpi(filters),
    queryFn: () => SalesPerformanceService.getKPISummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

// Filter options query
export const useSalesFilterOptionsQuery = (
  options?: Omit<UseQueryOptions<FilterOptionsResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: salesPerformanceKeys.filterOptions(),
    queryFn: () => SalesPerformanceService.getFilterOptions(),
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options don't change often
    retry: 2,
    ...options,
  });
};
