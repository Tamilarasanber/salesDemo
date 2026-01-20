import { useState, useCallback, useMemo } from "react";
import {
  Filter,
  RefreshCw,
  Info,
  Plane,
  Ship,
  Container,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import KPITile from "@/Components/Dashboard/KPITile";
import ModeCard from "@/Components/Dashboard/ModeCard";
import ChartCard from "@/Components/Dashboard/ChartCard";
import FilterPanel from "@/Components/Dashboard/FilterPanel";
import Header from "@/Components/Layout/Header";
import { useDashboardData } from "@/Store/contexts/DashboardDataContext";
import { Skeleton } from "@/Components/ui/skeleton";
import { KPIFilterPayload } from "@/API/Services/SalesPerformanceService";
import { useSalesKPIQuery } from "@/API/query/SalesPerformanceQuery";
import {
  formatLargeNumber,
  formatExactNumber,
  truncateText,
  needsTruncation,
} from "@/Utils/formatters";
import { toast } from "sonner";

// Chart types state for each chart
interface ChartTypeState {
  conversion: string;
  shipmentTrend: string;
  customerTrend: string;
  productTrend: string;
  topSalesmen: string;
  topAgents: string;
  topCustomers: string;
  topTradelane: string;
}

const SalesPerformance = () => {
  const {
    filters,
    applyFilters,
    setChartFilter,
    clearChartFilters,
    activeChartFilters,
    periodInfo,
  } = useDashboardData();

  const [showFilters, setShowFilters] = useState(false);
  const [chartTypes, setChartTypes] = useState<ChartTypeState>({
    conversion: "bar",
    shipmentTrend: "line",
    customerTrend: "bar",
    productTrend: "bar",
    topSalesmen: "bar",
    topAgents: "bar",
    topCustomers: "bar",
    topTradelane: "bar",
  });

  const lastRefreshed = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatChange = (change: number | null) => {
    if (change === null) return null;
    return Math.round(change * 10) / 10;
  };

  // Create filter payload from current filters for API call
  const kpiFilters: KPIFilterPayload = {
    period: filters.period || "last-6-months",
    country: filters.country || [],
    branch: filters.branch || [],
    service_type: filters.service || [],
    trade: filters.trade || [],
    customer_name: filters.customer || [],
    salesman: filters.salesman || [],
    agent: filters.agent || [],
    carrier: filters.carrier || [],
    tradelane: filters.tradelane || [],
    product: filters.product || [],
    tos: filters.tos || [],
  };

  // Fetch KPI data from backend API
  const { data: kpiResponse, isLoading, isError, error, refetch } = useSalesKPIQuery(kpiFilters);

  // Display error toast if API call fails
  if (isError) {
    console.error("KPI API Error:", error);
  }

  // Get chart data from backend response
  const chartData = useMemo(() => {
    if (!kpiResponse?.chartData) {
      return {
        conversionData: [],
        shipmentTrendData: [],
        customerTrendData: [],
        productTrendData: [],
        topSalesmenData: [],
        topAgentsData: [],
        topCustomersData: [],
        topTradelaneData: [],
      };
    }
    return kpiResponse.chartData;
  }, [kpiResponse]);

  // Get customer keys for stacked bar chart
  const customerKeys = useMemo(() => {
    if (chartData.customerTrendData.length > 0) {
      return Object.keys(chartData.customerTrendData[0]).filter((k) => k !== "month");
    }
    return [];
  }, [chartData.customerTrendData]);

  // Get product keys for stacked bar chart
  const productKeys = useMemo(() => {
    if (chartData.productTrendData.length > 0) {
      return Object.keys(chartData.productTrendData[0]).filter((k) => k !== "month");
    }
    return [];
  }, [chartData.productTrendData]);

  const chartColors = [
    "hsl(var(--azure))",
    "hsl(var(--lime))",
    "hsl(var(--grey-blue))",
    "hsl(var(--muted))",
    "hsl(var(--coral))",
  ];

  const pieColors = [
    "#4DC9FF",
    "#00D458",
    "#3D5A73",
    "#A9B6C5",
    "#FF6B6B",
    "#FFB84D",
    "#9B59B6",
    "#1ABC9C",
    "#E74C3C",
    "#3498DB",
  ];

  // Active filter chips
  const hasActiveChartFilters = Object.values(activeChartFilters).some(
    (v) => v
  );

  // Custom Y-axis tick formatter with large number formatting
  const formatYAxisTick = (value: number) => formatLargeNumber(value, 1);

  // Custom tooltip formatter with exact values
  const formatTooltipValue = (value: number, name: string, unit?: string) => {
    return [formatExactNumber(value, unit), name];
  };

  // Custom Y-axis tick for truncated names
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const displayText = truncateText(payload.value, 15);
    const needsTooltip = needsTruncation(payload.value, 15);

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{needsTooltip ? payload.value : undefined}</title>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="hsl(var(--muted-foreground))"
          fontSize={11}
          style={{ cursor: needsTooltip ? "help" : "default" }}
        >
          {displayText}
        </text>
      </g>
    );
  };

  // Custom X-axis tick with auto-rotation for long labels
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const displayText = truncateText(payload.value, 12);
    const needsTooltip = needsTruncation(payload.value, 12);

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{needsTooltip ? payload.value : undefined}</title>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="end"
          fill="hsl(var(--muted-foreground))"
          fontSize={10}
          transform="rotate(-35)"
          style={{ cursor: needsTooltip ? "help" : "default" }}
        >
          {displayText}
        </text>
      </g>
    );
  };

  // Handle chart type change
  const handleChartTypeChange = useCallback(
    (chartId: keyof ChartTypeState, type: string) => {
      setChartTypes((prev) => ({ ...prev, [chartId]: type }));
    },
    []
  );

  // Dashboard export functionality - uses browser print for full dashboard capture
  const handleDashboardExport = useCallback(
    (format: "png" | "jpeg" | "svg") => {
      toast.info(
        `To export the full dashboard as ${format.toUpperCase()}, use your browser's print function (Ctrl/Cmd + P) and select "Save as PDF" or use a screenshot tool.`
      );

      // For a quick solution, trigger print dialog
      if (format === "png" || format === "jpeg") {
        const userChoice = window.confirm(
          "Would you like to open the print dialog to save the dashboard?\n\nTip: Select 'Save as PDF' in the print destination."
        );
        if (userChoice) {
          window.print();
        }
      }
    },
    []
  );

  // Render chart based on type - Enquiry Conversion
  const renderConversionChart = (height: number = 280) => {
    const data = chartData.conversionData;

    // Cross-filter handler using rawMonth
    const handleChartClick = (d: any) => {
      if (d?.activePayload?.[0]?.payload?.rawMonth) {
        setChartFilter("month", d.activePayload[0].payload.rawMonth);
      }
    };

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.conversion) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="enquiries"
                name="Enquiries"
                stroke="hsl(var(--grey-blue))"
                strokeWidth={2}
                dot
                cursor="pointer"
              />
              <Line
                type="monotone"
                dataKey="converted"
                name="Converted"
                stroke="hsl(var(--azure))"
                strokeWidth={2}
                dot
                cursor="pointer"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="enquiries"
                name="Enquiries"
                fill="hsl(var(--grey-blue))"
                stroke="hsl(var(--grey-blue))"
                fillOpacity={0.3}
                cursor="pointer"
              />
              <Area
                type="monotone"
                dataKey="converted"
                name="Converted"
                fill="hsl(var(--azure))"
                stroke="hsl(var(--azure))"
                fillOpacity={0.3}
                cursor="pointer"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        const pieData = [
          {
            name: "Enquiries",
            value: data.reduce((sum, d) => sum + d.enquiries, 0),
          },
          {
            name: "Converted",
            value: data.reduce((sum, d) => sum + d.converted, 0),
          },
        ];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: ${formatLargeNumber(value)}`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                unit="%"
                label={{
                  value: "Rate %",
                  angle: 90,
                  position: "insideRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="enquiries"
                name="Enquiries"
                fill="hsl(var(--grey-blue))"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                yAxisId="left"
                dataKey="converted"
                name="Converted"
                fill="hsl(var(--azure))"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                name="Rate %"
                stroke="hsl(var(--lime))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--lime))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Shipment Trend chart
  const renderShipmentTrendChart = (height: number = 280) => {
    const data = chartData.shipmentTrendData;

    // Cross-filter handler using rawMonth
    const handleChartClick = (d: any) => {
      if (d?.activePayload?.[0]?.payload?.rawMonth) {
        setChartFilter("month", d.activePayload[0].payload.rawMonth);
      }
    };

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.shipmentTrend) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Bar
                dataKey="shipments"
                fill="hsl(var(--azure))"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Area
                type="monotone"
                dataKey="shipments"
                fill="hsl(var(--azure))"
                stroke="hsl(var(--azure))"
                fillOpacity={0.3}
                cursor="pointer"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        const pieData = data.map((d) => ({
          name: d.month,
          value: d.shipments,
        }));
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: ${formatLargeNumber(value)}`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // line
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} onClick={handleChartClick}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Line
                type="monotone"
                dataKey="shipments"
                stroke="hsl(var(--azure))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--azure))",
                  strokeWidth: 2,
                  cursor: "pointer",
                }}
                activeDot={{ r: 6, fill: "hsl(var(--azure))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Customer-wise Trend chart
  const renderCustomerTrendChart = (height: number = 280) => {
    const data = chartData.customerTrendData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.customerTrend) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("customer", e.value)
                }
              />
              {customerKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={2}
                  dot
                  cursor="pointer"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("customer", e.value)
                }
              />
              {customerKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  fill={chartColors[index % chartColors.length]}
                  stroke={chartColors[index % chartColors.length]}
                  fillOpacity={0.6}
                  cursor="pointer"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        const totals = customerKeys.map((key) => ({
          name: key,
          value: data.reduce((sum, d) => sum + ((d as any)[key] || 0), 0),
        }));
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={totals}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="value"
                label={({ name, value }) =>
                  `${truncateText(name, 10)}: ${formatLargeNumber(value)}`
                }
                onClick={(data) =>
                  data.name !== "Others" &&
                  setChartFilter("customer", data.name)
                }
              >
                {totals.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar (stacked)
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("customer", e.value)
                }
              />
              {customerKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={chartColors[index % chartColors.length]}
                  radius={
                    index === customerKeys.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                  cursor="pointer"
                  onClick={() =>
                    key !== "Others" && setChartFilter("customer", key)
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Product-wise Trend chart
  const renderProductTrendChart = (height: number = 280) => {
    const data = chartData.productTrendData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.productTrend) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("product", e.value)
                }
              />
              {productKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={2}
                  dot
                  cursor="pointer"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("product", e.value)
                }
              />
              {productKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  fill={chartColors[index % chartColors.length]}
                  stroke={chartColors[index % chartColors.length]}
                  fillOpacity={0.6}
                  cursor="pointer"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        const totals = productKeys.map((key) => ({
          name: key,
          value: data.reduce((sum, d) => sum + ((d as any)[key] || 0), 0),
        }));
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={totals}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="value"
                label={({ name, value }) =>
                  `${truncateText(name, 10)}: ${formatLargeNumber(value)}`
                }
                onClick={(data) =>
                  data.name !== "Others" &&
                  setChartFilter("product", data.name)
                }
              >
                {totals.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar (stacked)
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                label={{
                  value: "Period",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend
                onClick={(e) =>
                  e.value &&
                  e.value !== "Others" &&
                  setChartFilter("product", e.value)
                }
              />
              {productKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={chartColors[index % chartColors.length]}
                  radius={
                    index === productKeys.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                  cursor="pointer"
                  onClick={() =>
                    key !== "Others" && setChartFilter("product", key)
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Top 10 Salesmen chart
  const renderTopSalesmenChart = (height: number = 280) => {
    const data = chartData.topSalesmenData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.topSalesmen) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Line
                type="monotone"
                dataKey="shipments"
                stroke="hsl(var(--azure))"
                strokeWidth={2}
                dot={{ cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="shipments"
                nameKey="name"
                label={({ name, shipments }) =>
                  `${truncateText(name, 8)}: ${formatLargeNumber(shipments)}`
                }
                onClick={(data) => setChartFilter("salesman", data.name)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
                label={{
                  value: "Salesman",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                  dx: -60,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Bar
                dataKey="shipments"
                fill="hsl(var(--azure))"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => setChartFilter("salesman", data.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Top 10 Agents chart
  const renderTopAgentsChart = (height: number = 280) => {
    const data = chartData.topAgentsData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.topAgents) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Line
                type="monotone"
                dataKey="shipments"
                stroke="hsl(var(--lime))"
                strokeWidth={2}
                dot={{ cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="shipments"
                nameKey="name"
                label={({ name, shipments }) =>
                  `${truncateText(name, 8)}: ${formatLargeNumber(shipments)}`
                }
                onClick={(data) => setChartFilter("agent", data.name)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
                label={{
                  value: "Agent",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                  dx: -60,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Bar
                dataKey="shipments"
                fill="hsl(var(--lime))"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => setChartFilter("agent", data.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Top 10 Customers chart
  const renderTopCustomersChart = (height: number = 280) => {
    const data = chartData.topCustomersData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.topCustomers) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Line
                type="monotone"
                dataKey="shipments"
                stroke="hsl(var(--azure))"
                strokeWidth={2}
                dot={{ cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="shipments"
                nameKey="name"
                label={({ name, shipments }) =>
                  `${truncateText(name, 8)}: ${formatLargeNumber(shipments)}`
                }
                onClick={(data) => setChartFilter("customer", data.name)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Shipments",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={CustomYAxisTick}
                width={75}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) =>
                  formatTooltipValue(value, name)
                }
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Bar
                dataKey="shipments"
                fill="hsl(var(--azure))"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => setChartFilter("customer", data.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render Top 10 Tradelane chart
  const renderTopTradelaneChart = (height: number = 280) => {
    const data = chartData.topTradelaneData;

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (chartTypes.topTradelane) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="lane"
                tick={CustomXAxisTick}
                height={70}
                interval={0}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  formatExactNumber(value, "CBM"),
                  "Volume",
                ]}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--azure))"
                strokeWidth={2}
                dot={{ cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 100)}
                dataKey="volume"
                nameKey="lane"
                label={({ lane, volume }) =>
                  `${truncateText(lane, 8)}: ${formatLargeNumber(volume)}`
                }
                onClick={(data) => setChartFilter("tradelane", data.lane)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  formatExactNumber(value, "CBM"),
                  "Volume",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="lane"
                tick={CustomXAxisTick}
                height={70}
                interval={0}
                label={{
                  value: "Tradelane",
                  position: "insideBottom",
                  offset: -55,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Volume (CBM)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  formatExactNumber(value, name === "volume" ? "CBM" : "KG"),
                  name,
                ]}
                labelFormatter={(label) => `Click to filter by ${label}`}
              />
              <Bar
                dataKey="volume"
                fill="hsl(var(--azure))"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => setChartFilter("tradelane", data.lane)}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Header actions specific to this page
  const headerActions = (
    <>
      {/* Period Selector */}
      <Select
        value={filters.period}
        onValueChange={(v) => applyFilters({ period: v })}
      >
        <SelectTrigger className="w-40 bg-grey-blue border-grey-blue text-primary-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last-4-weeks">Last 4 Weeks</SelectItem>
          <SelectItem value="last-2-months">Last 2 Months</SelectItem>
          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters Button */}
      <Button
        variant="outline"
        onClick={() => setShowFilters(true)}
        className="bg-grey-blue border-grey-blue text-primary-foreground hover:bg-azure hover:border-azure hover:text-accent-foreground"
      >
        <Filter size={16} className="mr-2" />
        Filters
      </Button>

      {/* Dashboard Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-9 h-9 rounded-full bg-grey-blue flex items-center justify-center hover:bg-azure/20 transition-colors">
            <Download size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDashboardExport("png")}>
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDashboardExport("jpeg")}>
            Export as JPEG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDashboardExport("svg")}>
            Export as SVG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        title="Sales Performance"
        subtitle="Dashboard"
        actions={headerActions}
        showAdminProfile
      />

      {/* Last Refreshed + Data Source */}
      <div className="w-full max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Data Source: Backend API
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-help">
              <RefreshCw size={12} />
              Last refreshed on {lastRefreshed}
              <Info size={12} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Data is refreshed periodically. This is not real-time data.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Active Chart Filters */}
      {hasActiveChartFilters && (
        <div className="w-full max-w-[1600px] mx-auto px-6 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            {activeChartFilters.month && (
              <span className="filter-chip">
                Month: {activeChartFilters.month}
                <button onClick={() => setChartFilter("month", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeChartFilters.customer && (
              <span className="filter-chip">
                Customer: {truncateText(activeChartFilters.customer, 15)}
                <button onClick={() => setChartFilter("customer", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeChartFilters.salesman && (
              <span className="filter-chip">
                Salesman: {activeChartFilters.salesman}
                <button onClick={() => setChartFilter("salesman", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeChartFilters.agent && (
              <span className="filter-chip">
                Agent: {truncateText(activeChartFilters.agent, 15)}
                <button onClick={() => setChartFilter("agent", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeChartFilters.tradelane && (
              <span className="filter-chip">
                Tradelane: {activeChartFilters.tradelane}
                <button onClick={() => setChartFilter("tradelane", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeChartFilters.product && (
              <span className="filter-chip">
                Product: {truncateText(activeChartFilters.product, 15)}
                <button onClick={() => setChartFilter("product", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={clearChartFilters}
              className="text-xs text-azure hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto px-6 pb-10">
        {/* Section: Key Performance Indicators (Consolidated) */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Key Performance Indicators
            </h2>

            {/* Period-driven comparison indicator (read-only) */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Comparison:</span>
              <span className="font-medium text-foreground">
                {periodInfo.comparisonLabel}
              </span>
            </div>
          </div>

          {/* ROW 1: Performance Funnel - Enquiries, Converted Shipments, Conversion Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {isLoading || !kpiResponse ? (
              <>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </>
            ) : (
              <>
                <KPITile
                  title="Total Enquiries"
                  value={formatLargeNumber(kpiResponse.current.totalEnquiries)}
                  rawValue={kpiResponse.current.totalEnquiries}
                  change={formatChange(kpiResponse.changes.totalEnquiries)}
                  changeLabel={periodInfo.comparisonLabel}
                  comparisonType={periodInfo.comparisonType}
                  sparklineType={periodInfo.sparklineType}
                  sparklineData={kpiResponse.sparklineData?.enquiries}
                />
                <KPITile
                  title="Converted Shipments"
                  value={formatLargeNumber(kpiResponse.current.convertedShipments)}
                  rawValue={kpiResponse.current.convertedShipments}
                  change={formatChange(kpiResponse.changes.convertedShipments)}
                  changeLabel={periodInfo.comparisonLabel}
                  comparisonType={periodInfo.comparisonType}
                  sparklineType={periodInfo.sparklineType}
                  sparklineData={kpiResponse.sparklineData?.convertedShipments}
                />
                <KPITile
                  title="Conversion Rate"
                  value={`${kpiResponse.current.conversionRate.toFixed(1)}%`}
                  change={formatChange(kpiResponse.changes.conversionRate)}
                  changeLabel={periodInfo.comparisonLabel}
                  comparisonType={periodInfo.comparisonType}
                  sparklineType={periodInfo.sparklineType}
                  sparklineData={kpiResponse.sparklineData?.conversionRate}
                />
              </>
            )}
          </div>

          {/* ROW 2: Mode-wise Operational KPIs - AIR, OCEAN LCL, OCEAN FCL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading || !kpiResponse ? (
              <>
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </>
            ) : (
              <>
                <ModeCard
                  title="Air"
                  icon={<Plane size={20} />}
                  shipments={kpiResponse.modeData.air.shipments}
                  volume={kpiResponse.modeData.air.volume}
                  weight={kpiResponse.modeData.air.weight}
                  change={kpiResponse.modeData.air.change ?? undefined}
                  sparklineType={periodInfo.sparklineType}
                  comparisonLabel={periodInfo.comparisonLabel}
                />
                <ModeCard
                  title="Ocean LCL"
                  icon={<Ship size={20} />}
                  shipments={kpiResponse.modeData.lcl.shipments}
                  volume={kpiResponse.modeData.lcl.volume}
                  weight={kpiResponse.modeData.lcl.weight}
                  change={kpiResponse.modeData.lcl.change ?? undefined}
                  sparklineType={periodInfo.sparklineType}
                  comparisonLabel={periodInfo.comparisonLabel}
                />
                <ModeCard
                  title="Ocean FCL"
                  icon={<Container size={20} />}
                  shipments={kpiResponse.modeData.fcl.shipments}
                  volume={kpiResponse.modeData.fcl.volume}
                  weight={kpiResponse.modeData.fcl.weight}
                  teus={kpiResponse.modeData.fcl.teus}
                  change={kpiResponse.modeData.fcl.change ?? undefined}
                  sparklineType={periodInfo.sparklineType}
                  comparisonLabel={periodInfo.comparisonLabel}
                />
              </>
            )}
          </div>
        </section>

        {/* Section: Charts */}
        <section className="space-y-6">
          {/* Row 1: Conversion & Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Enquiry Conversion"
              subtitle={
                periodInfo.chartGranularity === "weekly"
                  ? "Weekly enquiries vs conversions"
                  : "Monthly enquiries vs conversions"
              }
              chartType={chartTypes.conversion}
              onChartTypeChange={(type) =>
                handleChartTypeChange("conversion", type)
              }
              expandedChildren={renderConversionChart(500)}
            >
              {renderConversionChart()}
            </ChartCard>

            <ChartCard
              title="Shipment Trend"
              subtitle={
                periodInfo.chartGranularity === "weekly"
                  ? "Weekly shipment volume"
                  : "Monthly shipment volume"
              }
              chartType={chartTypes.shipmentTrend}
              onChartTypeChange={(type) =>
                handleChartTypeChange("shipmentTrend", type)
              }
              expandedChildren={renderShipmentTrendChart(500)}
            >
              {renderShipmentTrendChart()}
            </ChartCard>
          </div>

          {/* Row 2: Customer Trend */}
          <ChartCard
            title="Customer-wise Trend"
            subtitle={
              periodInfo.chartGranularity === "weekly"
                ? "Weekly shipment distribution by top customers"
                : "Monthly shipment distribution by top customers"
            }
            chartType={chartTypes.customerTrend}
            onChartTypeChange={(type) =>
              handleChartTypeChange("customerTrend", type)
            }
            expandedChildren={renderCustomerTrendChart(500)}
          >
            {renderCustomerTrendChart()}
          </ChartCard>

          {/* Row 3: Product Trend */}
          <ChartCard
            title="Product-wise Trend"
            subtitle={
              periodInfo.chartGranularity === "weekly"
                ? "Weekly shipment distribution by top products"
                : "Monthly shipment distribution by top products"
            }
            chartType={chartTypes.productTrend}
            onChartTypeChange={(type) =>
              handleChartTypeChange("productTrend", type)
            }
            expandedChildren={renderProductTrendChart(500)}
          >
            {renderProductTrendChart()}
          </ChartCard>

          {/* Row 4: Top 10 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top 10 Salesman"
              subtitle="By shipment count with conversion rate"
              chartType={chartTypes.topSalesmen}
              onChartTypeChange={(type) =>
                handleChartTypeChange("topSalesmen", type)
              }
              expandedChildren={renderTopSalesmenChart(500)}
            >
              {renderTopSalesmenChart()}
            </ChartCard>

            <ChartCard
              title="Top 10 Agent"
              subtitle="By shipment count with MoM change"
              chartType={chartTypes.topAgents}
              onChartTypeChange={(type) =>
                handleChartTypeChange("topAgents", type)
              }
              expandedChildren={renderTopAgentsChart(500)}
            >
              {renderTopAgentsChart()}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top 10 Customers"
              subtitle="By shipment count"
              chartType={chartTypes.topCustomers}
              onChartTypeChange={(type) =>
                handleChartTypeChange("topCustomers", type)
              }
              expandedChildren={renderTopCustomersChart(500)}
            >
              {renderTopCustomersChart()}
            </ChartCard>

            <ChartCard
              title="Top 10 Tradelane"
              subtitle="By volume (CBM)"
              chartType={chartTypes.topTradelane}
              onChartTypeChange={(type) =>
                handleChartTypeChange("topTradelane", type)
              }
              expandedChildren={renderTopTradelaneChart(500)}
            >
              {renderTopTradelaneChart()}
            </ChartCard>
          </div>
        </section>
      </main>

      {/* Filter Panel */}
      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
};

export default SalesPerformance;
