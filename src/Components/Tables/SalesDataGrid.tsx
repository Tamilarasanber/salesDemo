// Sales Data Grid component (placeholder for MUI X DataGrid)
import { useMemo } from "react";

interface Column<T> {
  field: keyof T;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (params: { row: T; value: T[keyof T] }) => React.ReactNode;
}

interface SalesDataGridProps<T> {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

const SalesDataGrid = <T extends { id: string | number }>({
  rows,
  columns,
  pageSize = 10,
  loading = false,
  onRowClick,
}: SalesDataGridProps<T>) => {
  const displayedRows = useMemo(
    () => rows.slice(0, pageSize),
    [rows, pageSize]
  );

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="animate-spin w-8 h-8 border-2 border-azure border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                style={{ width: col.width, flex: col.flex }}
              >
                {col.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={String(col.field)}
                  className="px-4 py-3 text-sm text-foreground"
                >
                  {col.renderCell
                    ? col.renderCell({ row, value: row[col.field] })
                    : String(row[col.field] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
};

export default SalesDataGrid;
