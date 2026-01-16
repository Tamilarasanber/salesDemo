// Common type definitions

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface ChartConfig {
  type: "bar" | "line" | "area" | "pie";
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface ExportConfig {
  format: "csv" | "xlsx" | "pdf" | "png" | "jpeg";
  filename?: string;
  includeHeaders?: boolean;
}
