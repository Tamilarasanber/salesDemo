// Chart utility functions

/**
 * Format large numbers with K/M/B abbreviations
 */
export const formatLargeNumber = (
  value: number,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) return "0";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue < 1000) {
    return sign + absValue.toFixed(0);
  }

  if (absValue < 1000000) {
    const formatted = (absValue / 1000).toFixed(decimals);
    const cleaned = parseFloat(formatted).toString();
    return sign + cleaned + "K";
  }

  if (absValue < 1000000000) {
    const formatted = (absValue / 1000000).toFixed(decimals);
    const cleaned = parseFloat(formatted).toString();
    return sign + cleaned + "M";
  }

  const formatted = (absValue / 1000000000).toFixed(decimals);
  const cleaned = parseFloat(formatted).toString();
  return sign + cleaned + "B";
};

/**
 * Format exact number with unit for tooltip display
 */
export const formatExactNumber = (value: number, unit?: string): string => {
  if (value === null || value === undefined || isNaN(value)) return "0";

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 15): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "…";
};

/**
 * Check if text needs truncation
 */
export const needsTruncation = (
  text: string,
  maxLength: number = 15
): boolean => {
  return text && text.length > maxLength;
};

/**
 * Generate chart colors array
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    "hsl(var(--azure))",
    "hsl(var(--lime))",
    "hsl(var(--grey-blue))",
    "hsl(var(--muted))",
    "hsl(var(--coral))",
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Pie chart colors
 */
export const pieColors = [
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

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

/**
 * Get trend color class
 */
export const getTrendColorClass = (value: number | null): string => {
  if (value === null) return "text-muted-foreground";
  if (value > 0) return "text-success";
  if (value < 0) return "text-destructive";
  return "text-muted-foreground";
};

/**
 * Format Y-axis tick
 */
export const formatYAxisTick = (value: number): string => {
  return formatLargeNumber(value, 1);
};

/**
 * Chart tooltip style
 */
export const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};
