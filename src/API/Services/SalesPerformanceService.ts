import axiosInstance from "@/API/Configs/App.config";

export interface KPIFilterPayload {
  period: string;
  country: string[];
  branch: string[];
  service_type: string[];
  trade: string[];
  customer_name: string[];
  salesman: string[];
  agent: string[];
  carrier: string[];
  tradelane: string[];
  product: string[];
  tos: string[];
}

// Monthly trend data point for charts
export interface MonthlyTrendItem {
  month: string; // Display format: "Jul 25" or "W28"
  rawMonth?: string; // Raw format: "2025-07" for cross-filtering
  period_raw?: string; // Alternative raw format from backend
  enquiries: number;
  converted: number;
  shipments: number;
  rate: number;
}

// Customer/Product trend data
export interface TrendDataItem {
  month: string;
  [key: string]: number | string;
}

// Top entity data
export interface TopSalesmanItem {
  name: string;
  shipments: number;
  conversion: number;
}

export interface TopAgentItem {
  name: string;
  shipments: number;
  change: number;
}

export interface TopCustomerItem {
  name: string;
  shipments: number;
  revenue: number;
}

export interface TopTradelaneItem {
  lane: string;
  volume: number;
  weight: number;
}

export interface ChartData {
  conversionData: MonthlyTrendItem[];
  shipmentTrendData: MonthlyTrendItem[];
  customerTrendData: TrendDataItem[];
  productTrendData: TrendDataItem[];
  topSalesmenData: TopSalesmanItem[];
  topAgentsData: TopAgentItem[];
  topCustomersData: TopCustomerItem[];
  topTradelaneData: TopTradelaneItem[];
}

export interface SparklineData {
  enquiries: number[];
  convertedShipments: number[];
  conversionRate: number[];
}

export interface KPIResponse {
  current: {
    totalEnquiries: number;
    convertedShipments: number;
    totalShipments: number;
    conversionRate: number;
    activeCustomers: number;
    totalVolume: number;
    totalWeight: number;
  };
  previous: {
    totalEnquiries: number;
    convertedShipments: number;
    totalShipments: number;
    conversionRate: number;
    activeCustomers: number;
    totalVolume: number;
    totalWeight: number;
  };
  changes: {
    totalEnquiries: number | null;
    convertedShipments: number | null;
    totalShipments: number | null;
    conversionRate: number | null;
    activeCustomers: number | null;
    totalVolume: number | null;
    totalWeight: number | null;
  };
  modeData: {
    air: { shipments: number; volume: number; weight: number; change: number | null };
    lcl: { shipments: number; volume: number; weight: number; change: number | null };
    fcl: { shipments: number; volume: number; weight: number; teus: number; change: number | null };
  };
  period: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  chartData: ChartData;
  sparklineData: SparklineData;
}

export interface FilterOptionsResponse {
  countries: string[];
  branches: string[];
  service_types: string[];
  trades: string[];
  customers: string[];
  salesmen: string[];
  agents: string[];
  carriers: string[];
  tradelanes: string[];
  products: string[];
  tos_options: string[];
}

// Period mapping from UI values to API values
const mapPeriodToAPI = (period: string): string => {
  const periodMap: Record<string, string> = {
    "last-4-weeks": "LAST_4_WEEKS",
    "last-2-months": "LAST_3_MONTHS",
    "last-6-months": "LAST_6_MONTHS",
    "last-12-months": "LAST_12_MONTHS",
  };
  return periodMap[period] || "LAST_6_MONTHS";
};

export const SalesPerformanceService = {
  // Fetch complete KPI and chart data from FastAPI backend
  async getKPISummary(filters: KPIFilterPayload): Promise<KPIResponse> {
    const payload = {
      ...filters,
      period: mapPeriodToAPI(filters.period),
    };

    const response = await axiosInstance.post<KPIResponse>("sales/kpi", payload);
    
    // Normalize chart data - ensure rawMonth is set for cross-filtering
    const data = response.data;
    if (data.chartData?.conversionData) {
      data.chartData.conversionData = data.chartData.conversionData.map(item => ({
        ...item,
        rawMonth: item.rawMonth || item.period_raw || item.month,
      }));
    }
    if (data.chartData?.shipmentTrendData) {
      data.chartData.shipmentTrendData = data.chartData.shipmentTrendData.map(item => ({
        ...item,
        rawMonth: item.rawMonth || item.period_raw || item.month,
      }));
    }
    
    return data;
  },

  // Fetch filter options from backend
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const response = await axiosInstance.post<FilterOptionsResponse>("sales/kpi/filter-options", {});
    return response.data;
  },
};
