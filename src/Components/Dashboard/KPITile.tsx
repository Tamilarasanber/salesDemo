import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
  KPI_DEFINITIONS,
  formatLargeNumber,
  formatExactNumber,
} from "@/Utils/formatters";

interface KPITileProps {
  title: string;
  value: string | number;
  rawValue?: number;
  unit?: string;
  change?: number | null;
  changeLabel?: string;
  tooltip?: string;
  sparklineData?: number[];
  className?: string;
  comparisonType?: "wow" | "mom" | "qoq" | "yoy";
  sparklineType?: "weekly" | "monthly";
  sparklineLabels?: string[];
}

// Generate week date ranges for tooltip
const getWeekRanges = (dataLength: number): string[] => {
  const today = new Date();
  const ranges: string[] = [];

  for (let i = dataLength - 1; i >= 0; i--) {
    const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    ranges.push(`${formatDate(weekStart)}–${formatDate(weekEnd)}`);
  }

  return ranges;
};

// Generate month labels for tooltip
const getMonthLabels = (dataLength: number): string[] => {
  const today = new Date();
  const labels: string[] = [];

  for (let i = dataLength - 1; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(
      month.toLocaleDateString("en", { month: "short", year: "2-digit" })
    );
  }

  return labels;
};

const MiniSparkline = ({
  data,
  title,
  sparklineType = "weekly",
  labels,
}: {
  data: number[];
  title?: string;
  sparklineType?: "weekly" | "monthly";
  labels?: string[];
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  // Generate tooltip content based on sparkline type or provided labels
  const autoLabels =
    sparklineType === "weekly"
      ? getWeekRanges(data.length)
      : getMonthLabels(data.length);

  const labelsToUse = labels && labels.length === data.length ? labels : autoLabels;
  const periodLabel = sparklineType === "weekly" ? "Week" : "Month";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <svg width={width} height={height} className="opacity-40 cursor-help">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="text-xs space-y-1">
          <p className="font-semibold mb-1">
            {sparklineType === "weekly" ? "Weekly" : "Monthly"} Trend
            {title ? ` - ${title}` : ""}
          </p>
          {data.map((val, i) => (
            <p key={i} className="text-muted-foreground font-mono">
              {labelsToUse[i] ?? `${periodLabel} ${i + 1}`}: {formatLargeNumber(val)}
            </p>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const KPITile = ({
  title,
  value,
  rawValue,
  unit,
  change,
  changeLabel = "vs prev period",
  tooltip,
  sparklineData,
  sparklineLabels,
  className = "",
  comparisonType = "mom",
  sparklineType = "weekly",
}: KPITileProps) => {
  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 0) return <TrendingUp size={14} className="text-success" />;
    if (change < 0)
      return <TrendingDown size={14} className="text-destructive" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return "text-muted-foreground";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const formatChange = () => {
    if (change === undefined || change === null) return "N/A";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // Get KPI definition for enhanced tooltip
  const kpiDef = KPI_DEFINITIONS[title];

  // Comparison label based on type
  const comparisonLabels = {
    wow: "Week-over-Week",
    mom: "Month-over-Month",
    qoq: "Quarter-over-Quarter",
    yoy: "Year-over-Year",
  };

  // Build enhanced tooltip content
  const getEnhancedTooltip = () => {
    if (!kpiDef) return tooltip;

    const comparisonText =
      change === null || change === undefined
        ? "N/A (No data for previous period)"
        : `${formatChange()} ${comparisonLabels[comparisonType]}`;

    return (
      <div className="space-y-2 text-xs max-w-[280px]">
        <div>
          <span className="font-semibold text-foreground">KPI Definition:</span>
          <p className="text-muted-foreground">{kpiDef.definition}</p>
        </div>
        <div>
          <span className="font-semibold text-foreground">Formula:</span>
          <p className="text-muted-foreground font-mono">{kpiDef.formula}</p>
        </div>
        <div>
          <span className="font-semibold text-foreground">Comparison:</span>
          <p className="text-muted-foreground">{comparisonText}</p>
        </div>
        {rawValue !== undefined && (
          <div>
            <span className="font-semibold text-foreground">Exact Value:</span>
            <p className="text-muted-foreground">
              {formatExactNumber(rawValue, unit)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Display value - use formatted large number if rawValue provided
  const displayValue =
    typeof value === "number" ? formatLargeNumber(value) : value;

  return (
    <div className={`kpi-tile ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <Tooltip>
            <TooltipTrigger>
              <Info
                size={14}
                className="text-muted-foreground/60 hover:text-muted-foreground cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-3">
              {kpiDef ? (
                getEnhancedTooltip()
              ) : (
                <p className="text-xs">{tooltip}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <MiniSparkline
            data={sparklineData}
            title={title}
            sparklineType={sparklineType}
            labels={sparklineLabels}
          />
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          {/* Value with tooltip for exact number */}
          {rawValue !== undefined ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-2xl font-bold text-foreground cursor-help">
                  {displayValue}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-mono">
                  {formatExactNumber(rawValue, unit)}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <p className="text-2xl font-bold text-foreground">{displayValue}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              {formatChange()}
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPITile;
