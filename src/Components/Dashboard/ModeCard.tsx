import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import { formatLargeNumber, formatExactNumber } from "@/Utils/formatters";

interface ModeCardProps {
  title: string;
  icon: React.ReactNode;
  shipments: number;
  volume: number;
  weight: number;
  teus?: number;
  change?: number;
  sparklineData?: number[];
  sparklineType?: "weekly" | "monthly";
  comparisonLabel?: string;
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
  color,
  title,
  sparklineType = "weekly",
}: {
  data: number[];
  color: string;
  title?: string;
  sparklineType?: "weekly" | "monthly";
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 20;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  // Generate tooltip content based on sparkline type
  const labels =
    sparklineType === "weekly"
      ? getWeekRanges(data.length)
      : getMonthLabels(data.length);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <svg width={width} height={height} className="opacity-60 cursor-help">
          <polyline
            fill="none"
            stroke={color}
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
              {sparklineType === "weekly" ? `Week ${i + 1}` : labels[i]}:{" "}
              {formatLargeNumber(val)}
            </p>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const ModeCard = ({
  title,
  icon,
  shipments,
  volume,
  weight,
  teus,
  change,
  sparklineData = [40, 35, 50, 45, 60, 55],
  sparklineType = "weekly",
  comparisonLabel = "vs prev period",
}: ModeCardProps) => {
  // Determine what secondary metric to show based on mode
  const isAir = title.toLowerCase().includes("air");
  const isOceanFCL = title.toLowerCase().includes("fcl");
  const isOceanLCL = title.toLowerCase().includes("lcl");
  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 0) return <TrendingUp size={12} className="text-success" />;
    if (change < 0)
      return <TrendingDown size={12} className="text-destructive" />;
    return <Minus size={12} className="text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return "text-muted-foreground";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="kpi-tile">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-grey-blue">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-0.5">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {change > 0 ? "+" : ""}
                  {change?.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {comparisonLabel}
                </span>
              </div>
            )}
          </div>
        </div>
        <MiniSparkline
          data={sparklineData}
          color="hsl(var(--azure))"
          title={title}
          sparklineType={sparklineType}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Shipments</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-lg font-semibold text-foreground cursor-help">
                {formatLargeNumber(shipments)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-mono">
                {formatExactNumber(shipments)}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Secondary metric based on mode type */}
        {isAir && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-lg font-semibold text-foreground cursor-help">
                  {formatLargeNumber(weight)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    KG
                  </span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono">
                  {formatExactNumber(weight, "KG")}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {isOceanLCL && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">CBM</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-lg font-semibold text-foreground cursor-help">
                  {formatLargeNumber(volume)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    CBM
                  </span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono">
                  {formatExactNumber(volume, "CBM")}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {isOceanFCL && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">TEUs</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-lg font-semibold text-foreground cursor-help">
                  {formatLargeNumber(teus || Math.round(volume / 33))}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    TEUs
                  </span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono">
                  {formatExactNumber(teus || Math.round(volume / 33), "TEUs")}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeCard;
