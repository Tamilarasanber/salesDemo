// Reusable MUI DataGrid wrapper with sorting, pagination, and search
import React, { useState, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarQuickFilter,
  GridSlots,
} from "@mui/x-data-grid";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { cn } from "@/lib/utils";

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  className?: string;
  height?: number | string;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  onRowClick?: (params: any) => void;
  showSearch?: boolean;
  stickyHeader?: boolean;
  autoHeight?: boolean;
  getRowId?: (row: any) => string | number;
}

// Custom toolbar with search
function CustomToolbar() {
  return (
    <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
      <GridToolbarQuickFilter
        quickFilterParser={(searchInput: string) =>
          searchInput.split(",").map((value) => value.trim())
        }
        debounceMs={300}
        sx={{ width: "100%", maxWidth: 320 }}
      />
    </Box>
  );
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  loading = false,
  className,
  height = 500,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  onRowClick,
  showSearch = true,
  stickyHeader = true,
  autoHeight = false,
  getRowId,
}) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize,
  });

  const slots = useMemo(() => {
    const slotConfig: Partial<GridSlots> = {};
    if (showSearch) {
      slotConfig.toolbar = CustomToolbar;
    }
    return slotConfig;
  }, [showSearch]);

  return (
    <Box
      className={cn("w-full", className)}
      sx={{
        height: autoHeight ? "auto" : height,
        "& .MuiDataGrid-root": {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "action.hover",
          ...(stickyHeader && {
            position: "sticky",
            top: 0,
            zIndex: 1,
          }),
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid",
          borderColor: "divider",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        onRowClick={onRowClick}
        getRowId={getRowId}
        autoHeight={autoHeight}
        slots={slots}
        slotProps={{
          toolbar: {
            showQuickFilter: showSearch,
          },
        }}
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
};

export default DataTable;
