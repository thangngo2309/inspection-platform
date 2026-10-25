"use client";

import { Box, Paper } from "@mui/material";
import {
  DataGrid,
  type DataGridProps,
  type GridValidRowModel,
} from "@mui/x-data-grid";

export type HDataGridProps<R extends GridValidRowModel = GridValidRowModel> =
  DataGridProps<R> & {
    minHeight?: number;
  };

export function HDataGrid<R extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  loading = false,
  minHeight = 420,
  pageSizeOptions = [10, 20, 50, 100],
  initialState,
  sx,
  ...props
}: HDataGridProps<R>) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <Box sx={{ width: "100%", minHeight }}>
        <DataGrid<R>
          {...props}
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={pageSizeOptions}
          initialState={{
            ...initialState,
            pagination: {
              ...initialState?.pagination,
              paginationModel: initialState?.pagination?.paginationModel ?? {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeader": {
              bgcolor: "action.hover",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            ...sx,
          }}
        />
      </Box>
    </Paper>
  );
}
