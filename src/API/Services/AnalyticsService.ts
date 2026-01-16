// Analytics API service
import axiosInstance from "@/API/Configs/App.config";
import { DataRecord, KPIData } from "@/Types/Analytics.types";

export const AnalyticsService = {
  // Fetch dashboard data
  async getDashboardData(): Promise<DataRecord[]> {
    const response = await axiosInstance.get<DataRecord[]>(
      "/analytics/dashboard"
    );
    return response.data;
  },

 
  // Fetch chart data
  async getChartData(chartType: string, period: string): Promise<unknown> {
    const response = await axiosInstance.get(`/analytics/charts/${chartType}`, {
      params: { period },
    });
    return response.data;
  },

  // Export data
  async exportData(format: "csv" | "xlsx" | "pdf"): Promise<Blob> {
    const response = await axiosInstance.get(`/analytics/export`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};

export default AnalyticsService;
