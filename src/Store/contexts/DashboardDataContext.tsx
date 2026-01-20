import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";

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
  // Cross-filter from chart clicks
  chartFilters: {
    month?: string;
    customer?: string;
    salesman?: string;
    agent?: string;
    tradelane?: string;
    product?: string;
  };
}

// Period info for synchronization
export interface PeriodInfo {
  type: "weekly" | "monthly";
  comparisonType: "wow" | "mom" | "qoq";
  comparisonLabel: string;
  chartGranularity: "weekly" | "monthly";
  sparklineType: "weekly" | "monthly";
}

interface DashboardDataContextType {
  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  applyFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Chart cross-filtering
  setChartFilter: (
    key: keyof FilterState["chartFilters"],
    value: string | undefined
  ) => void;
  clearChartFilters: () => void;
  activeChartFilters: FilterState["chartFilters"];

  // Period info
  periodInfo: PeriodInfo;
}

const initialFilters: FilterState = {
  period: "last-6-months",
  country: [],
  branch: [],
  service: [],
  trade: [],
  customer: [],
  salesman: [],
  agent: [],
  carrier: [],
  tradelane: [],
  product: [],
  tos: [],
  chartFilters: {},
};

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

// Helper function to get period info based on period filter
const getPeriodInfo = (period: string): PeriodInfo => {
  switch (period) {
    case "last-4-weeks":
      return {
        type: "weekly",
        comparisonType: "wow",
        comparisonLabel: "WoW %",
        chartGranularity: "weekly",
        sparklineType: "weekly",
      };
    case "last-2-months":
      return {
        type: "monthly",
        comparisonType: "mom",
        comparisonLabel: "MoM %",
        chartGranularity: "monthly",
        sparklineType: "weekly",
      };
    case "last-6-months":
      return {
        type: "monthly",
        comparisonType: "qoq",
        comparisonLabel: "QoQ %",
        chartGranularity: "monthly",
        sparklineType: "monthly",
      };
    case "custom":
      return {
        type: "monthly",
        comparisonType: "mom",
        comparisonLabel: "vs prev period",
        chartGranularity: "monthly",
        sparklineType: "monthly",
      };
    default:
      return {
        type: "monthly",
        comparisonType: "qoq",
        comparisonLabel: "QoQ %",
        chartGranularity: "monthly",
        sparklineType: "monthly",
      };
  }
};

export const DashboardDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Get period info based on current filter
  const periodInfo = useMemo(
    () => getPeriodInfo(filters.period),
    [filters.period]
  );

  // Action handlers
  const applyFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const setChartFilter = useCallback(
    (key: keyof FilterState["chartFilters"], value: string | undefined) => {
      setFilters((prev) => ({
        ...prev,
        chartFilters: {
          ...prev.chartFilters,
          [key]: value,
        },
      }));
    },
    []
  );

  const clearChartFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      chartFilters: {},
    }));
  }, []);

  const value: DashboardDataContextType = {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    setChartFilter,
    clearChartFilters,
    activeChartFilters: filters.chartFilters,
    periodInfo,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error(
      "useDashboardData must be used within DashboardDataProvider"
    );
  }
  return context;
};
