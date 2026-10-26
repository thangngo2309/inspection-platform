"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Stack, TextField } from "@mui/material";
import { Search, VisibilityOutlined } from "@mui/icons-material";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import {
  customerVehiclesRepository as repo,
  type VehicleRow,
} from "@/lib/repositories/customer-vehicles.repository";

const vehicleTypes: Record<string, string> = {
  car: "Ô tô con",
  truck: "Xe tải",
  bus: "Xe khách",
};

export default function VehiclesPage() {
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["vehicles", pagination.page, pagination.pageSize, search],
    queryFn: () =>
      repo.vehicles({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      }),
  });

  const columns = useMemo<GridColDef<VehicleRow>[]>(
    () => [
      {
        field: "licensePlate",
        headerName: "Biển số",
        minWidth: 145,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="outlined"
            label={row.licensePlate}
            sx={{ fontWeight: 700 }}
          />
        ),
      },
      {
        field: "vehicleType",
        headerName: "Loại xe",
        minWidth: 130,
        valueFormatter: (value: string | null) =>
          vehicleTypes[value ?? ""] ?? value ?? "—",
      },
      {
        field: "brand",
        headerName: "Hãng xe",
        minWidth: 140,
        valueFormatter: (value: string | null) => value || "—",
      },
      {
        field: "model",
        headerName: "Dòng xe",
        minWidth: 140,
        valueFormatter: (value: string | null) => value || "—",
      },
      {
        field: "manufactureYear",
        headerName: "Năm SX",
        minWidth: 100,
      },
      {
        field: "customerName",
        headerName: "Người liên hệ gần nhất",
        minWidth: 200,
        flex: 1,
      },
      {
        field: "bookingCount",
        headerName: "Số booking",
        minWidth: 115,
        type: "number",
      },
      {
        field: "lastBookingAt",
        headerName: "Booking gần nhất",
        minWidth: 150,
        valueFormatter: (value: string | null) =>
          value ? new Date(value).toLocaleDateString("vi-VN") : "—",
      },
      {
        field: "actions",
        headerName: "Thao tác",
        minWidth: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Button
            component={Link}
            href={`/vehicles/${encodeURIComponent(row.id)}`}
            startIcon={<VisibilityOutlined />}
            size="small"
          >
            Lịch sử
          </Button>
        ),
      },
    ],
    []
  );

  const searchNow = () => {
    setPagination((prev) => ({
      ...prev,
      page: 0,
    }));
    setSearch(searchInput.trim());
  };

  return (
    <Stack spacing={3}>
      <HPageHeader
        title="Quản lý phương tiện"
        description="Tổng hợp phương tiện từ lịch sử booking, kể cả khách không đăng nhập."
        actions={
          <Button variant="outlined" onClick={() => void refetch()}>
            Làm mới
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          size="small"
          fullWidth
          placeholder="Biển số, hãng xe, dòng xe, số khung..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchNow();
          }}
        />

        <Button variant="contained" startIcon={<Search />} onClick={searchNow}>
          Tìm kiếm
        </Button>
      </Stack>

      {isError && (
        <Button color="error" onClick={() => void refetch()}>
          Không tải được dữ liệu. Bấm để thử lại.
        </Button>
      )}

      <HDataGrid
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[10, 20, 50]}
        minHeight={540}
      />
    </Stack>
  );
}
