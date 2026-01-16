// Analytics type definitions

export interface DataRecord {
  month: string;
  enquiries: number;
  converted_shipments: number;
  total_shipments: number;
  volume: number;
  weight: number;
  customer: string;
  salesman: string;
  agent: string;
  country: string;
  branch: string;
  service: string;
  trade: string;
  tradelane: string;
  carrier: string;
  product: string;
  tos: string;
  shipment_date?: string;
}

export interface FilterState {
  period: string;
  country: string[];
  branch: string[];
  service: string[];
  trade: string[];
  customer: string[];
  salesman: string[];
  agent: string[];
  carrier: string[];
  tradelane: string[];
  product: string[];
  tos: string[];
  chartFilters: Record<string, string>;
}

export interface KPIData {
  totalEnquiries: number;
  convertedShipments: number;
  totalShipments: number;
  conversionRate: number;
  activeCustomers: number;
  totalVolume: number;
  totalWeight: number;
}

export interface ComparisonData {
  current: KPIData;
  previous: KPIData;
  changes: {
    totalEnquiries: number | null;
    convertedShipments: number | null;
    totalShipments: number | null;
    conversionRate: number | null;
    activeCustomers: number | null;
    totalVolume: number | null;
    totalWeight: number | null;
  };
}

export interface ModeData {
  shipments: number;
  volume: number;
  weight: number;
  change: number | null;
  sparklineData: number[];
}

export interface PeriodInfo {
  type: "weekly" | "monthly";
  comparisonType: "wow" | "mom" | "qoq";
  comparisonLabel: string;
  chartGranularity: "weekly" | "monthly";
  sparklineType: "weekly" | "monthly";
}

export interface ChartDataItem {
  label: string;
  month: string;
  rawMonth: string;
  enquiries?: number;
  converted?: number;
  rate?: number;
  shipments?: number;
  isCurrent?: boolean;
}

export interface TopPerformerData {
  name: string;
  shipments: number;
  conversion?: number;
  change?: number;
  revenue?: number;
}

export interface TradelaneData {
  lane: string;
  volume: number;
  weight: number;
}
