import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { SalesPerformanceService, computeKPIs } from "@/API/Services/SalesPerformanceService";

// Data record type matching the template structure
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

// Period info for synchronization
export interface PeriodInfo {
  type: "weekly" | "monthly";
  comparisonType: "wow" | "mom" | "qoq";
  comparisonLabel: string;
  chartGranularity: "weekly" | "monthly";
  sparklineType: "weekly" | "monthly";
}

interface DashboardDataContextType {
  // Data source
  rawData: DataRecord[];
  filteredData: DataRecord[];
  isLoading: boolean;

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

  // Comparison type (derived from period)
  comparisonType: "mom" | "qoq" | "yoy";
  setComparisonType: (type: "mom" | "qoq" | "yoy") => void;

  // Period info
  periodInfo: PeriodInfo;

  // Computed KPIs
  kpiData: ComparisonData;
  modeData: {
    fcl: ModeData;
    lcl: ModeData;
    air: ModeData;
  };

  // Sparkline data for KPIs
  kpiSparklineData: {
    enquiries: number[];
    convertedShipments: number[];
    totalShipments: number[];
    conversionRate: number[];
  };
  // Labels aligned with kpi sparkline arrays (earliest -> latest)
  kpiSparklineLabels: string[];

  // Chart data
  chartData: {
    conversionData: Array<{
      label: string;
      month: string;
      rawMonth: string;
      enquiries: number;
      converted: number;
      rate: number;
      isCurrent?: boolean;
    }>;
    shipmentTrendData: Array<{
      label: string;
      month: string;
      rawMonth: string;
      shipments: number;
      isCurrent?: boolean;
    }>;
    customerTrendData: Array<Record<string, number | string>>;
    productTrendData: Array<Record<string, number | string>>;
    topSalesmenData: Array<{
      name: string;
      shipments: number;
      conversion: number;
    }>;
    topAgentsData: Array<{ name: string; shipments: number; change: number }>;
    topCustomersData: Array<{
      name: string;
      shipments: number;
      revenue: number;
    }>;
    topTradelaneData: Array<{ lane: string; volume: number; weight: number }>;
  };

  // Filter options derived from data
  filterOptions: {
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
  };

  // Data upload
  // (Upload/reset removed — data fetched via API)
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

// Default data removed; data is fetched via API through SalesPerformanceService

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
        sparklineType: "weekly", // Context / momentum only
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

// Helper to get weeks from a date range
const getWeeksInRange = (
  startDate: Date,
  endDate: Date
): Array<{ start: Date; end: Date; label: string }> => {
  const weeks: Array<{ start: Date; end: Date; label: string }> = [];
  const current = new Date(startDate);
  let weekNum = 1;

  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime());
    }

    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: `Week ${weekNum}`,
    });

    current.setDate(current.getDate() + 7);
    weekNum++;
  }

  return weeks;
};

// Helper to get months in range
const getMonthsInRange = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    months.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}`
    );
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

export const DashboardDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rawData, setRawData] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [comparisonType, setComparisonType] = useState<"mom" | "qoq" | "yoy">(
    "mom"
  );

  // Fetch raw records from backend and populate rawData so charts use backend data
  useEffect(() => {
    let mounted = true;

    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const records = await SalesPerformanceService.getRecords(filters.period);
        if (mounted) {
          setRawData(records);
        }
      } catch (err) {
        // keep existing data on error
        // eslint-disable-next-line no-console
        console.error("Failed to fetch /sales/kpi", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRecords();

    return () => {
      mounted = false;
    };
  }, [filters.period]);

  // Helper to parse shipment_date (supports Excel serial dates)
  // MUST be defined before periodBoundaries which uses it
  const parseShipmentDate = useCallback(
    (dateStr: string | undefined): Date | null => {
      if (!dateStr) return null;

      const raw = String(dateStr).trim();
      if (!raw) return null;

      // Excel often provides dates as serial numbers (e.g., "45992")
      if (/^\d+(\.\d+)?$/.test(raw)) {
        const serial = Number(raw);
        if (!Number.isFinite(serial) || serial <= 0) return null;

        // Excel 1900 date system: 25569 == 1970-01-01
        const ms = (serial - 25569) * 86400 * 1000;
        const d = new Date(ms);
        if (Number.isNaN(d.getTime())) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }

      // Support formats: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, DD/MM/YY
      let parts: string[];
      if (raw.includes("-")) {
        parts = raw.split("-");
        if (parts[0]?.length === 4) {
          // YYYY-MM-DD
          return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
        }
        // DD-MM-YYYY or DD-MM-YY
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000; // Convert YY to 20YY
        return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
      }

      if (raw.includes("/")) {
        parts = raw.split("/");
        // DD/MM/YYYY or DD/MM/YY
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000; // Convert YY to 20YY
        return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
      }

      // Fallback: try native parsing (e.g., "Tue Dec 02 2025 ...")
      const parsed = Date.parse(raw);
      if (!Number.isNaN(parsed)) {
        const d = new Date(parsed);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }

      return null;
    },
    []
  );

  // Get period info based on current filter
  const periodInfo = useMemo(
    () => getPeriodInfo(filters.period),
    [filters.period]
  );

  // Derive filter options from raw data
  const filterOptions = useMemo(() => {
    const getUnique = (key: keyof DataRecord) =>
      [...new Set(rawData.map((r) => r[key] as string))].filter(Boolean).sort();

    return {
      country: getUnique("country"),
      branch: getUnique("branch"),
      service: getUnique("service"),
      trade: getUnique("trade"),
      customer: getUnique("customer"),
      salesman: getUnique("salesman"),
      agent: getUnique("agent"),
      carrier: getUnique("carrier"),
      tradelane: getUnique("tradelane"),
      product: getUnique("product"),
      tos: getUnique("tos"),
    };
  }, [rawData]);

  // Calculate date boundaries based on period
  // IMPORTANT: Period ranges are INCLUSIVE of current month
  // Last 6 months: current month and 5 prior months (e.g., Dec = Jul-Dec)
  // Last 2 months: current month and 1 prior month (e.g., Dec = Nov-Dec)
  const periodBoundaries = useMemo(() => {
    // Use the latest date in the data as reference (not system date)
    const allDates = rawData
      .map((r) => parseShipmentDate(r.shipment_date))
      .filter((d): d is Date => d !== null);

    const latestDataDate =
      allDates.length > 0
        ? new Date(Math.max(...allDates.map((d) => d.getTime())))
        : new Date();

    const currentYear = latestDataDate.getFullYear();
    const currentMonth = latestDataDate.getMonth(); // 0-indexed

    let startDate: Date;
    let endDate = latestDataDate;

    switch (filters.period) {
      case "last-4-weeks":
        // Will be handled separately using Sunday-Saturday week logic
        startDate = new Date(
          latestDataDate.getTime() - 4 * 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "last-2-months":
        // Last 2 months: current month + 1 prior month
        // E.g., if current = Dec (11), start = Nov (10)
        startDate = new Date(currentYear, currentMonth - 1, 1);
        break;
      case "last-6-months":
        // Last 6 months: current month + 5 prior months
        // E.g., if current = Dec (11), start = Jul (6)
        startDate = new Date(currentYear, currentMonth - 5, 1);
        break;
      default:
        startDate = new Date(currentYear, currentMonth - 5, 1);
    }

    return { startDate, endDate, latestDataDate };
  }, [filters.period, rawData]);

  // Helper to get Sunday of a given week (week starts on Sunday)
  const getSundayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper to get Saturday of a given week
  const getSaturdayOfWeek = (date: Date): Date => {
    const sunday = getSundayOfWeek(date);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);
    return saturday;
  };

  // Filter data based on current filters - this gives the FULL period data (lumpsum)
  const filteredData = useMemo(() => {
    let result = [...rawData];

    // Apply period filter
    if (filters.period === "last-4-weeks") {
      // For Last 4 Weeks: use Sunday-Saturday week definition
      // Include current partial week + 3 prior complete weeks
      const dates = result
        .map((r) => parseShipmentDate(r.shipment_date))
        .filter((d): d is Date => d !== null);

      if (dates.length > 0) {
        const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

        // Current week's Sunday (Week 4 start)
        const week4Sunday = getSundayOfWeek(latestDate);

        // Week 1 starts 3 weeks before Week 4's Sunday
        const week1Sunday = new Date(week4Sunday);
        week1Sunday.setDate(week1Sunday.getDate() - 21);

        result = result.filter((r) => {
          const d = parseShipmentDate(r.shipment_date);
          return d ? d >= week1Sunday && d <= latestDate : false;
        });
      } else {
        // Fallback: use month-based filtering
        const { startDate } = periodBoundaries;
        const cutoffMonth = `${startDate.getFullYear()}-${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")}`;
        result = result.filter((r) => r.month >= cutoffMonth);
      }
    } else {
      // For Last 2 months and Last 6 months: use month column
      const { startDate } = periodBoundaries;
      const cutoffMonth = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}`;
      result = result.filter((r) => r.month >= cutoffMonth);
    }

    // Apply dimension filters
    const applyArrayFilter = (
      data: DataRecord[],
      key: keyof DataRecord,
      values: string[]
    ) => {
      if (values.length === 0) return data;
      return data.filter((r) => values.includes(r[key] as string));
    };

    result = applyArrayFilter(result, "country", filters.country);
    result = applyArrayFilter(result, "branch", filters.branch);
    result = applyArrayFilter(result, "service", filters.service);
    result = applyArrayFilter(result, "trade", filters.trade);
    result = applyArrayFilter(result, "customer", filters.customer);
    result = applyArrayFilter(result, "salesman", filters.salesman);
    result = applyArrayFilter(result, "agent", filters.agent);
    result = applyArrayFilter(result, "carrier", filters.carrier);
    result = applyArrayFilter(result, "tradelane", filters.tradelane);
    result = applyArrayFilter(result, "product", filters.product);
    result = applyArrayFilter(result, "tos", filters.tos);

    // Apply chart cross-filters
    if (filters.chartFilters.month) {
      result = result.filter((r) => r.month === filters.chartFilters.month);
    }
    if (filters.chartFilters.customer) {
      result = result.filter(
        (r) => r.customer === filters.chartFilters.customer
      );
    }
    if (filters.chartFilters.salesman) {
      result = result.filter(
        (r) => r.salesman === filters.chartFilters.salesman
      );
    }
    if (filters.chartFilters.agent) {
      result = result.filter((r) => r.agent === filters.chartFilters.agent);
    }
    if (filters.chartFilters.tradelane) {
      result = result.filter(
        (r) => r.tradelane === filters.chartFilters.tradelane
      );
    }
    if (filters.chartFilters.product) {
      result = result.filter((r) => r.product === filters.chartFilters.product);
    }

    return result;
  }, [rawData, filters, periodBoundaries]);

  // Calculate KPIs with comparison based on period type
  // KPI VALUE = LUMPSUM of the selected period
  const kpiData = useMemo((): ComparisonData => {
    // Use centralized KPI computation from SalesPerformanceService
    // Current = FULL selected period (lumpsum)
    const current = computeKPIs(filteredData as any);

    // Calculate previous period based on comparison type derived from period
    const months = [...new Set(filteredData.map((r) => r.month))].sort();
    let previousData: DataRecord[] = [];

    // Calculate conversion rate % change based on period type
    // Formula: Conversion Rate (%) = (Converted_Shipments / Total_Enquiries) × 100
    // % Change = ((Current Rate - Previous Rate) / Previous Rate) × 100

    let currentPeriodData: DataRecord[] = [];
    let previousPeriodData: DataRecord[] = [];

    if (periodInfo.comparisonType === "wow") {
      // Week-over-Week: current week vs previous week
      // For weekly, use the last two distinct months as proxy (current vs previous)
      if (months.length >= 2) {
        const currentMonth = months[months.length - 1];
        const previousMonth = months[months.length - 2];
        currentPeriodData = filteredData.filter(
          (r) => r.month === currentMonth
        );
        previousPeriodData = rawData.filter((r) => r.month === previousMonth);
      } else if (months.length === 1) {
        const latestMonth = months[0];
        const [year, month] = latestMonth.split("-").map(Number);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(
          2,
          "0"
        )}`;
        currentPeriodData = filteredData;
        previousPeriodData = rawData.filter((r) => r.month === prevMonthStr);
      }
    } else if (periodInfo.comparisonType === "mom") {
      // Month-over-Month: current month vs last month
      if (months.length >= 2) {
        const currentMonth = months[months.length - 1];
        const previousMonth = months[months.length - 2];
        currentPeriodData = filteredData.filter(
          (r) => r.month === currentMonth
        );
        previousPeriodData = rawData.filter((r) => r.month === previousMonth);
      } else if (months.length === 1) {
        const latestMonth = months[0];
        const [year, month] = latestMonth.split("-").map(Number);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(
          2,
          "0"
        )}`;
        currentPeriodData = filteredData;
        previousPeriodData = rawData.filter((r) => r.month === prevMonthStr);
      }
    } else if (periodInfo.comparisonType === "qoq") {
      // Quarter-over-Quarter: current quarter (last 3 months) vs previous quarter (3 months before that)
      // Current Quarter = last 3 months of selected period
      // Previous Quarter = 3 months before that
      if (months.length >= 3) {
        const currentQuarterMonths = months.slice(-3);
        currentPeriodData = filteredData.filter((r) =>
          currentQuarterMonths.includes(r.month)
        );

        // Previous quarter: 3 months before the start of current quarter
        const firstCurrentMonth = currentQuarterMonths[0];
        const [year, month] = firstCurrentMonth.split("-").map(Number);
        const prevQuarterMonths: string[] = [];
        for (let i = 1; i <= 3; i++) {
          let pm = month - i;
          let py = year;
          if (pm <= 0) {
            pm += 12;
            py -= 1;
          }
          prevQuarterMonths.push(`${py}-${String(pm).padStart(2, "0")}`);
        }
        previousPeriodData = rawData.filter((r) =>
          prevQuarterMonths.includes(r.month)
        );
      } else {
        currentPeriodData = filteredData;
        // Fallback: use 3 months prior
        if (months.length > 0) {
          const latestMonth = months[months.length - 1];
          const [year, month] = latestMonth.split("-").map(Number);
          const prevQuarterMonths: string[] = [];
          for (let i = 3; i <= 5; i++) {
            let pm = month - i;
            let py = year;
            if (pm <= 0) {
              pm += 12;
              py -= 1;
            }
            prevQuarterMonths.push(`${py}-${String(pm).padStart(2, "0")}`);
          }
          previousPeriodData = rawData.filter((r) =>
            prevQuarterMonths.includes(r.month)
          );
        }
      }
    }

    const currentPeriodKPI = computeKPIs(
      (currentPeriodData.length > 0 ? currentPeriodData : filteredData) as any
    );
    const previous = computeKPIs(previousPeriodData as any);

    // Calculate % change for conversion rate specifically
    const calcChange = (curr: number, prev: number): number | null => {
      if (prev === 0) return null;
      return ((curr - prev) / prev) * 100;
    };

    // For conversion rate change, compare the rates directly
    const currentConversionRate = current.conversionRate;
    const previousConversionRate =
      previous.totalEnquiries > 0
        ? (previous.convertedShipments / previous.totalEnquiries) * 100
        : 0;

    return {
      current,
      previous,
      changes: {
        totalEnquiries: calcChange(
          current.totalEnquiries,
          previous.totalEnquiries
        ),
        convertedShipments: calcChange(
          current.convertedShipments,
          previous.convertedShipments
        ),
        totalShipments: calcChange(
          current.totalShipments,
          previous.totalShipments
        ),
        // Conversion rate change: (current rate - previous rate) / previous rate * 100
        conversionRate:
          previousConversionRate > 0
            ? ((currentConversionRate - previousConversionRate) /
                previousConversionRate) *
              100
            : null,
        activeCustomers: calcChange(
          current.activeCustomers,
          previous.activeCustomers
        ),
        totalVolume: calcChange(current.totalVolume, previous.totalVolume),
        totalWeight: calcChange(current.totalWeight, previous.totalWeight),
      },
    };
  }, [filteredData, rawData, periodInfo]);

  // KPI Sparkline data based on period type
  const kpiSparklineData = useMemo(() => {
    const months = [...new Set(filteredData.map((r) => r.month))].sort();

    // Get data by month for sparklines
    const byMonth = months.map((m) => {
      const monthRecords = filteredData.filter((r) => r.month === m);
      const enquiries = monthRecords.reduce((sum, r) => sum + r.enquiries, 0);
      const convertedShipments = monthRecords.reduce(
        (sum, r) => sum + r.converted_shipments,
        0
      );
      const totalShipments = monthRecords.reduce(
        (sum, r) => sum + r.total_shipments,
        0
      );
      const conversionRate =
        enquiries > 0 ? (convertedShipments / enquiries) * 100 : 0;
      return { enquiries, convertedShipments, totalShipments, conversionRate };
    });

    // For weekly view (Last 4 Weeks), simulate weekly distribution
    if (periodInfo.sparklineType === "weekly" && byMonth.length > 0) {
      // Take last 4 data points or simulate 4 weekly points from monthly data
      const weeklyData = byMonth.slice(-4);
      if (weeklyData.length < 4) {
        // Pad with zeros if not enough data
        while (weeklyData.length < 4) {
          weeklyData.unshift({
            enquiries: 0,
            convertedShipments: 0,
            totalShipments: 0,
            conversionRate: 0,
          });
        }
      }
      return {
        enquiries: weeklyData.map((d) => d.enquiries),
        convertedShipments: weeklyData.map((d) => d.convertedShipments),
        totalShipments: weeklyData.map((d) => d.totalShipments),
        conversionRate: weeklyData.map((d) => d.conversionRate),
      };
    }

    // For monthly view (Last 6 Months)
    return {
      enquiries: byMonth.map((d) => d.enquiries),
      convertedShipments: byMonth.map((d) => d.convertedShipments),
      totalShipments: byMonth.map((d) => d.totalShipments),
      conversionRate: byMonth.map((d) => d.conversionRate),
    };
  }, [filteredData, periodInfo]);

  // Labels for sparklines (aligned with the arrays above)
  const kpiSparklineLabels = useMemo(() => {
    const months = [...new Set(filteredData.map((r) => r.month))].sort();

    if (periodInfo.sparklineType === "weekly") {
      // For weekly we mirror the weeklyData approach used above and take last 4 months as labels
      const weeklyMonths = months.slice(-4);
      return weeklyMonths.map((m) => {
        const date = new Date(m + "-01");
        return date.toLocaleDateString("en", { month: "short", year: "2-digit" });
      });
    }

    // Monthly - return all months formatted
    return months.map((m) => {
      const date = new Date(m + "-01");
      return date.toLocaleDateString("en", { month: "short", year: "2-digit" });
    });
  }, [filteredData, periodInfo]);

  // Calculate mode-wise data
  // CRITICAL: Use converted_shipments (NOT total_shipments) for all mode shipment KPIs
  const modeData = useMemo(() => {
    const calcMode = (service: string): ModeData => {
      const modeRecords = filteredData.filter((r) => r.service === service);
      // LUMPSUM totals for the period - USE converted_shipments
      const shipments = modeRecords.reduce(
        (sum, r) => sum + r.converted_shipments,
        0
      );
      const volume = modeRecords.reduce((sum, r) => sum + r.volume, 0);
      const weight = modeRecords.reduce((sum, r) => sum + r.weight, 0);

      // Previous period for comparison based on period type
      const months = [...new Set(modeRecords.map((r) => r.month))].sort();
      let change: number | null = null;

      if (months.length > 0) {
        const latestMonth = months[months.length - 1];
        const [year, month] = latestMonth.split("-").map(Number);

        let prevMonthStr: string;
        if (periodInfo.comparisonType === "qoq") {
          const prevQMonth = month - 3;
          const prevYear = prevQMonth <= 0 ? year - 1 : year;
          const adjMonth = prevQMonth <= 0 ? 12 + prevQMonth : prevQMonth;
          prevMonthStr = `${prevYear}-${String(adjMonth).padStart(2, "0")}`;
        } else {
          // WoW or MoM
          const prevMonth = month === 1 ? 12 : month - 1;
          const prevYear = month === 1 ? year - 1 : year;
          prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
        }

        const prevRecords = rawData.filter(
          (r) => r.service === service && r.month === prevMonthStr
        );
        // USE converted_shipments for comparison too
        const prevShipments = prevRecords.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );

        if (prevShipments > 0) {
          change = ((shipments - prevShipments) / prevShipments) * 100;
        }
      }

      // Sparkline data by month - USE converted_shipments
      const byMonth = months.reduce((acc, m) => {
        acc[m] = modeRecords
          .filter((r) => r.month === m)
          .reduce((sum, r) => sum + r.converted_shipments, 0);
        return acc;
      }, {} as Record<string, number>);

      let sparklineData = months.map((m) => byMonth[m] || 0);

      // For weekly sparkline type, take last 4 points
      if (periodInfo.sparklineType === "weekly") {
        sparklineData = sparklineData.slice(-4);
        while (sparklineData.length < 4) {
          sparklineData.unshift(0);
        }
      }

      return { shipments, volume, weight, change, sparklineData };
    };

    return {
      fcl: calcMode("FCL"),
      lcl: calcMode("LCL"),
      air: calcMode("AIR"),
    };
  }, [filteredData, rawData, periodInfo]);

  // Helper to get ISO week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };
  // Calculate chart data based on period granularity
  const chartData = useMemo(() => {
    const months = [...new Set(filteredData.map((r) => r.month))].sort();
    const isWeekly = filters.period === "last-4-weeks";

    // For Last 4 Weeks: use shipment_date with Sunday-Saturday week definition
    if (isWeekly) {
      // Get all dates from the data
      const allDates = filteredData
        .map((r) => parseShipmentDate(r.shipment_date))
        .filter((d): d is Date => d !== null);

      if (allDates.length === 0) {
        // Fallback if no shipment_date data
        return {
          conversionData: [1, 2, 3, 4].map((i) => ({
            label: `Week ${i}`,
            month: `Week ${i}`,
            rawMonth: `Week ${i}`,
            enquiries: 0,
            converted: 0,
            rate: 0,
            isCurrent: i === 4,
          })),
          shipmentTrendData: [1, 2, 3, 4].map((i) => ({
            label: `Week ${i}`,
            month: `Week ${i}`,
            rawMonth: `Week ${i}`,
            shipments: 0,
            isCurrent: i === 4,
          })),
          customerTrendData: [],
          productTrendData: [],
          topSalesmenData: [],
          topAgentsData: [],
          topCustomersData: [],
          topTradelaneData: [],
        };
      }

      // Find the latest date and build 4 weeks using Sunday-Saturday
      const latestDate = new Date(
        Math.max(...allDates.map((d) => d.getTime()))
      );

      // Week 4 = current week (Sunday containing latestDate to latestDate)
      const week4Sunday = getSundayOfWeek(latestDate);

      // Build 4 weeks: Week 1, Week 2, Week 3, Week 4 (current/partial)
      const weeks: Array<{
        start: Date;
        end: Date;
        label: string;
        isPartial: boolean;
      }> = [];
      for (let i = 0; i < 4; i++) {
        const weekSunday = new Date(week4Sunday);
        weekSunday.setDate(week4Sunday.getDate() - (3 - i) * 7);

        const weekSaturday = new Date(weekSunday);
        weekSaturday.setDate(weekSunday.getDate() + 6);
        weekSaturday.setHours(23, 59, 59, 999);

        // For Week 4, the end is the latest date (partial week)
        const actualEnd = i === 3 ? latestDate : weekSaturday;

        weeks.push({
          start: weekSunday,
          end: actualEnd,
          label: `Week ${i + 1}`,
          isPartial: i === 3,
        });
      }

      // Bucket data by week using shipment_date
      const weeklyBuckets = weeks.map((week) => {
        const weekRecords = filteredData.filter((r) => {
          const date = parseShipmentDate(r.shipment_date);
          if (!date) return false;
          const dateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
          const startTime = new Date(
            week.start.getFullYear(),
            week.start.getMonth(),
            week.start.getDate()
          ).getTime();
          const endTime = new Date(
            week.end.getFullYear(),
            week.end.getMonth(),
            week.end.getDate()
          ).getTime();
          return dateTime >= startTime && dateTime <= endTime;
        });

        const enquiries = weekRecords.reduce((sum, r) => sum + r.enquiries, 0);
        const converted = weekRecords.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        // CRITICAL: Use converted_shipments for shipment trend
        const shipments = weekRecords.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const rate = enquiries > 0 ? (converted / enquiries) * 100 : 0;

        return {
          label: week.label,
          enquiries,
          converted,
          shipments,
          rate: Math.round(rate * 10) / 10,
          isCurrent: week.isPartial,
          records: weekRecords,
        };
      });

      // Conversion data for weekly - include rawMonth for cross-filtering
      const conversionData = weeklyBuckets.map((w, idx) => ({
        label: w.label,
        month: w.label,
        rawMonth: w.label, // For weekly, rawMonth is the week label
        enquiries: w.enquiries,
        converted: w.converted,
        rate: w.rate,
        isCurrent: w.isCurrent,
      }));

      // Shipment trend for weekly - USE converted_shipments
      const shipmentTrendData = weeklyBuckets.map((w, idx) => ({
        label: w.label,
        month: w.label,
        rawMonth: w.label, // For weekly, rawMonth is the week label
        shipments: w.shipments,
        isCurrent: w.isCurrent,
      }));

      // Customer trend for weekly - USE converted_shipments, TOP 8 customers
      const allWeekRecords = weeklyBuckets.flatMap((w) => w.records);
      const customers = [...new Set(allWeekRecords.map((r) => r.customer))];
      const topCustomers = customers
        .map((c) => ({
          name: c,
          total: allWeekRecords
            .filter((r) => r.customer === c)
            .reduce((sum, r) => sum + r.converted_shipments, 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8) // TOP 8 customers instead of 3
        .map((c) => c.name);

      const customerTrendData = weeklyBuckets.map((w) => {
        const result: Record<string, number | string> = { month: w.label };
        topCustomers.forEach((customer) => {
          result[customer] = w.records
            .filter((r) => r.customer === customer)
            .reduce((sum, r) => sum + r.converted_shipments, 0);
        });
        result["Others"] = w.records
          .filter((r) => !topCustomers.includes(r.customer))
          .reduce((sum, r) => sum + r.converted_shipments, 0);
        return result;
      });

      // Product trend for weekly - USE converted_shipments, TOP 8 products
      const products = [...new Set(allWeekRecords.map((r) => r.product))];
      const topProducts = products
        .map((p) => ({
          name: p,
          total: allWeekRecords
            .filter((r) => r.product === p)
            .reduce((sum, r) => sum + r.converted_shipments, 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map((p) => p.name);

      const productTrendData = weeklyBuckets.map((w) => {
        const result: Record<string, number | string> = { month: w.label };
        topProducts.forEach((product) => {
          result[product] = w.records
            .filter((r) => r.product === product)
            .reduce((sum, r) => sum + r.converted_shipments, 0);
        });
        result["Others"] = w.records
          .filter((r) => !topProducts.includes(r.product))
          .reduce((sum, r) => sum + r.converted_shipments, 0);
        return result;
      });

      // Top salesmen - USE converted_shipments
      const salesmenAgg = [
        ...new Set(allWeekRecords.map((r) => r.salesman)),
      ].map((s) => {
        const records = allWeekRecords.filter((r) => r.salesman === s);
        const shipments = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const enquiries = records.reduce((sum, r) => sum + r.enquiries, 0);
        const converted = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        return {
          name: s,
          shipments,
          conversion:
            enquiries > 0 ? Math.round((converted / enquiries) * 100) : 0,
        };
      });
      const topSalesmenData = salesmenAgg
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 5);

      // Top agents - USE converted_shipments
      const agentsAgg = [...new Set(allWeekRecords.map((r) => r.agent))].map(
        (a) => {
          const records = allWeekRecords.filter((r) => r.agent === a);
          const shipments = records.reduce(
            (sum, r) => sum + r.converted_shipments,
            0
          );
          return {
            name: a,
            shipments,
            change: Math.floor(Math.random() * 40) - 10,
          };
        }
      );
      const topAgentsData = agentsAgg
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 5);

      // Top customers - USE converted_shipments
      const customersAgg = [
        ...new Set(allWeekRecords.map((r) => r.customer)),
      ].map((c) => {
        const records = allWeekRecords.filter((r) => r.customer === c);
        const shipments = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const volume = records.reduce((sum, r) => sum + r.volume, 0);
        return { name: c, shipments, revenue: volume * 100 };
      });
      const topCustomersData = customersAgg
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 5);

      // Top tradelanes
      const tradelaneAgg = [
        ...new Set(allWeekRecords.map((r) => r.tradelane)),
      ].map((t) => {
        const records = allWeekRecords.filter((r) => r.tradelane === t);
        const volume = records.reduce((sum, r) => sum + r.volume, 0);
        const weight = records.reduce((sum, r) => sum + r.weight, 0);
        return { lane: t, volume, weight };
      });
      const topTradelaneData = tradelaneAgg
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      return {
        conversionData,
        shipmentTrendData,
        customerTrendData,
        productTrendData,
        topSalesmenData,
        topAgentsData,
        topCustomersData,
        topTradelaneData,
      };
    }

    // Monthly granularity for other periods
    let targetDataPoints: number;
    switch (filters.period) {
      case "last-2-months":
        targetDataPoints = 2;
        break;
      case "last-6-months":
        targetDataPoints = 6;
        break;
      default:
        targetDataPoints = months.length;
    }

    // Slice months to match target data points
    const displayMonths = months.slice(-targetDataPoints);
    const latestMonth = displayMonths[displayMonths.length - 1];

    // Generate labels for monthly
    const getLabel = (month: string): string => {
      const date = new Date(month + "-01");
      return date.toLocaleDateString("en", { month: "short", year: "2-digit" });
    };

    // Conversion data - include rawMonth for cross-filtering
    const conversionData = displayMonths.map((month, idx) => {
      const monthRecords = filteredData.filter((r) => r.month === month);
      const enquiries = monthRecords.reduce((sum, r) => sum + r.enquiries, 0);
      const converted = monthRecords.reduce(
        (sum, r) => sum + r.converted_shipments,
        0
      );
      const rate = enquiries > 0 ? (converted / enquiries) * 100 : 0;
      const label = getLabel(month);

      return {
        label,
        month: label,
        rawMonth: month, // Store original month format for cross-filtering
        enquiries,
        converted,
        rate: Math.round(rate * 10) / 10,
        isCurrent: month === latestMonth,
      };
    });

    // Shipment trend - USE converted_shipments
    const shipmentTrendData = displayMonths.map((month, idx) => {
      const monthRecords = filteredData.filter((r) => r.month === month);
      // CRITICAL: Use converted_shipments for shipment trend
      const shipments = monthRecords.reduce(
        (sum, r) => sum + r.converted_shipments,
        0
      );
      const label = getLabel(month);

      return {
        label,
        month: label,
        rawMonth: month, // Store original month format for cross-filtering
        shipments,
        isCurrent: month === latestMonth,
      };
    });

    // Customer trend - USE converted_shipments, TOP 8 customers
    const customers = [...new Set(filteredData.map((r) => r.customer))];
    const topCustomers = customers
      .map((c) => ({
        name: c,
        total: filteredData
          .filter((r) => r.customer === c)
          .reduce((sum, r) => sum + r.converted_shipments, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8) // TOP 8 customers instead of 3
      .map((c) => c.name);

    const customerTrendData = displayMonths.map((month) => {
      const monthRecords = filteredData.filter((r) => r.month === month);
      const label = getLabel(month);

      const result: Record<string, number | string> = { month: label };

      topCustomers.forEach((customer) => {
        result[customer] = monthRecords
          .filter((r) => r.customer === customer)
          .reduce((sum, r) => sum + r.converted_shipments, 0);
      });

      result["Others"] = monthRecords
        .filter((r) => !topCustomers.includes(r.customer))
        .reduce((sum, r) => sum + r.converted_shipments, 0);

      return result;
    });

    // Product trend - USE converted_shipments, TOP 8 products
    const products = [...new Set(filteredData.map((r) => r.product))];
    const topProducts = products
      .map((p) => ({
        name: p,
        total: filteredData
          .filter((r) => r.product === p)
          .reduce((sum, r) => sum + r.converted_shipments, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((p) => p.name);

    const productTrendData = displayMonths.map((month) => {
      const monthRecords = filteredData.filter((r) => r.month === month);
      const label = getLabel(month);

      const result: Record<string, number | string> = { month: label };

      topProducts.forEach((product) => {
        result[product] = monthRecords
          .filter((r) => r.product === product)
          .reduce((sum, r) => sum + r.converted_shipments, 0);
      });

      result["Others"] = monthRecords
        .filter((r) => !topProducts.includes(r.product))
        .reduce((sum, r) => sum + r.converted_shipments, 0);

      return result;
    });

    // Top salesmen - USE converted_shipments
    const salesmenAgg = [...new Set(filteredData.map((r) => r.salesman))].map(
      (s) => {
        const records = filteredData.filter((r) => r.salesman === s);
        const shipments = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const enquiries = records.reduce((sum, r) => sum + r.enquiries, 0);
        const converted = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const conversion = enquiries > 0 ? (converted / enquiries) * 100 : 0;
        return {
          name: s,
          shipments,
          conversion: Math.round(conversion * 10) / 10,
        };
      }
    );
    const topSalesmenData = salesmenAgg
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10);

    // Top agents - USE converted_shipments
    const agentsAgg = [...new Set(filteredData.map((r) => r.agent))].map(
      (a) => {
        const records = filteredData.filter((r) => r.agent === a);
        const shipments = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        // MoM change would require previous period data - simplified here
        return { name: a, shipments, change: Math.random() * 20 - 5 };
      }
    );
    const topAgentsData = agentsAgg
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10);

    // Top customers - USE converted_shipments
    const customersAgg = [...new Set(filteredData.map((r) => r.customer))].map(
      (c) => {
        const records = filteredData.filter((r) => r.customer === c);
        const shipments = records.reduce(
          (sum, r) => sum + r.converted_shipments,
          0
        );
        const revenue = shipments * 0.0058; // Mock revenue calculation
        return { name: c, shipments, revenue: Math.round(revenue * 100) / 100 };
      }
    );
    const topCustomersData = customersAgg
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10);

    // Top tradelanes
    const tradelanesAgg = [
      ...new Set(filteredData.map((r) => r.tradelane)),
    ].map((t) => {
      const records = filteredData.filter((r) => r.tradelane === t);
      const volume = records.reduce((sum, r) => sum + r.volume, 0);
      const weight = records.reduce((sum, r) => sum + r.weight, 0);
      return { lane: t, volume, weight };
    });
    const topTradelaneData = tradelanesAgg
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return {
      conversionData,
      shipmentTrendData,
      customerTrendData,
      productTrendData,
      topSalesmenData,
      topAgentsData,
      topCustomersData,
      topTradelaneData,
    };
  }, [filteredData, periodInfo, filters.period]);

  // Action handlers
  // Upload/reset removed — data is managed via API and filters

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
    rawData,
    filteredData,
    isLoading,
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    setChartFilter,
    clearChartFilters,
    activeChartFilters: filters.chartFilters,
    comparisonType,
    setComparisonType,
    periodInfo,
    kpiData,
    kpiSparklineData,
      kpiSparklineLabels,
    modeData,
    chartData,
    filterOptions,
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
