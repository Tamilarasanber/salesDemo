// BI-standard number formatting utilities

/**
 * Format large numbers with K/M/B abbreviations
 * @param value - The number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted string with abbreviation
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
    // Remove trailing zeros
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
 * @param value - The number to format
 * @param unit - Optional unit suffix (KG, CBM, etc.)
 * @returns Formatted string with commas and unit
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
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default 15)
 * @returns Truncated string with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 15): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "…";
};

/**
 * Check if text needs truncation
 * @param text - The text to check
 * @param maxLength - Maximum length threshold (default 15)
 * @returns Boolean indicating if text was truncated
 */
export const needsTruncation = (
  text: string,
  maxLength: number = 15
): boolean => {
  return text && text.length > maxLength;
};

/**
 * KPI metadata for enhanced tooltips
 */
export interface KPIDefinition {
  title: string;
  definition: string;
  formula: string;
}

export const KPI_DEFINITIONS: Record<string, KPIDefinition> = {
  "Total Shipments": {
    title: "Total Shipments",
    definition: "Total number of shipments created in the selected period.",
    formula: "SUM(Total Shipments)",
  },
  "Total Volume": {
    title: "Total Volume",
    definition: "Aggregate volume in cubic meters for all shipments.",
    formula: "SUM(Volume) in CBM",
  },
  "Total Weight": {
    title: "Total Weight",
    definition: "Total weight in kilograms for all shipments.",
    formula: "SUM(Weight) in KG",
  },
  "Total Enquiries": {
    title: "Total Enquiries",
    definition: "Number of sales enquiries received in the period.",
    formula: "SUM(Enquiries)",
  },
  "Converted Shipments": {
    title: "Converted Shipments",
    definition: "Enquiries that resulted in confirmed bookings.",
    formula: "SUM(Converted Shipments)",
  },
  "Conversion Rate": {
    title: "Conversion Rate",
    definition: "Percentage of enquiries converted to shipments.",
    formula: "(Converted Shipments / Total Enquiries) × 100",
  },
  "Active Customers": {
    title: "Active Customers",
    definition: "Unique customers with at least one shipment in the period.",
    formula: "COUNT(DISTINCT Customer)",
  },
};
