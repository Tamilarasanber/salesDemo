// React Query hooks for analytics data
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import AnalyticsService from "@/API/Services/AnalyticsService";
import { DataRecord, KPIData } from "@/Types/Analytics.types";
import { SalesPerformanceService } from "@/API/Services/SalesPerformanceService";

// Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
  kpi: (period: string) => [...analyticsKeys.all, "kpi", period] as const,
  chart: (type: string, period: string) =>
    [...analyticsKeys.all, "chart", type, period] as const,
};

// Dashboard data query
export const useDashboardDataQuery = (
  options?: Omit<UseQueryOptions<DataRecord[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => AnalyticsService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// KPI summary query
export const useKPIQuery = (
  period: string,
  options?: Omit<UseQueryOptions<KPIData, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: analyticsKeys.kpi(period),
    queryFn: () => SalesPerformanceService.getKPISummary(period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Chart data query
export const useChartDataQuery = (
  chartType: string,
  period: string,
  options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: analyticsKeys.chart(chartType, period),
    queryFn: () => AnalyticsService.getChartData(chartType, period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
