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
  type CustomerRow,
} from "@/lib/repositories/customer-vehicles.repository";

export default function CustomersPage() {
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["customers", pagination.page, pagination.pageSize, search],
    queryFn: () =>
      repo.customers({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      }),
  });

  const columns = useMemo<GridColDef<CustomerRow>[]>(
    () => [
      {
        field: "fullName",
        headerName: "Khách hàng",
        minWidth: 210,
        flex: 1,
      },
      {
        field: "phone",
        headerName: "Số điện thoại",
        minWidth: 150,
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 190,
        flex: 1,
        valueFormatter: (value: string | null) => value || "—",
      },
      {
        field: "hasAccount",
        headerName: "Tài khoản",
        minWidth: 135,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="outlined"
            color={row.hasAccount ? "success" : "default"}
            label={row.hasAccount ? "Đã đăng ký" : "Khách vãng lai"}
          />
        ),
      },
      {
        field: "vehicleCount",
        headerName: "Số xe",
        minWidth: 100,
        type: "number",
      },
      {
        field: "bookingCount",
        headerName: "Số booking",
        minWidth: 120,
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
        minWidth: 145,
        sortable: false,
        renderCell: ({ row }) => (
          <Button
            component={Link}
            href={`/customers/${encodeURIComponent(row.phone)}`}
            size="small"
            startIcon={<VisibilityOutlined />}
          >
            Chi tiết
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
        title="Quản lý khách hàng"
        description="Danh sách khách đã đăng ký và người liên hệ từ Guest Booking."
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
          placeholder="Tìm tên, điện thoại, email..."
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
          Không tải được danh sách. Bấm để thử lại.
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
