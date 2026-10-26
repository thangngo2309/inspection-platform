"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { AssignmentInd, Refresh, Search } from "@mui/icons-material";

import type { AdminBookingRow } from "@inspection/contracts";
import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import { bookingRepository } from "@/lib/repositories/booking.repository";
import { AssignBookingDialog } from "@/components/bookings/AssignBookingDialog";

const statusLabels: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

export default function BookingsPage() {
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState<AdminBookingRow | null>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      "admin-bookings",
      pagination.page,
      pagination.pageSize,
      search,
      status,
    ],
    queryFn: () =>
      bookingRepository.list({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const columns = useMemo<GridColDef<AdminBookingRow>[]>(
    () => [
      {
        field: "code",
        headerName: "Mã booking",
        minWidth: 155,
      },
      {
        field: "customer",
        headerName: "Khách hàng",
        minWidth: 175,
        flex: 1,
      },
      {
        field: "phone",
        headerName: "Điện thoại",
        minWidth: 125,
      },
      {
        field: "plate",
        headerName: "Biển số",
        minWidth: 130,
      },
      {
        field: "centerName",
        headerName: "Trung tâm",
        minWidth: 195,
        flex: 1,
      },
      {
        field: "slotDate",
        headerName: "Ngày",
        minWidth: 115,
      },
      {
        field: "startTime",
        headerName: "Giờ",
        minWidth: 90,
        valueFormatter: (value: string) => value?.slice(0, 5) ?? "",
      },
      {
        field: "staffName",
        headerName: "Người phụ trách",
        minWidth: 165,
        renderCell: ({ row }) =>
          row.staffName ? (
            <Chip color="success" size="small" label={row.staffName} />
          ) : (
            <Chip
              color="warning"
              variant="outlined"
              size="small"
              label="Chưa phân công"
            />
          ),
      },
      {
        field: "status",
        headerName: "Trạng thái",
        minWidth: 150,
        renderCell: ({ value }) => (
          <Typography variant="body2">
            {statusLabels[value] ?? value}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Thao tác",
        minWidth: 145,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<AssignmentInd />}
            onClick={() => setSelected(row)}
          >
            Phân công
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <HPageHeader
        title="Quản lý Booking"
        description="Theo dõi lịch đăng kiểm và phân công nhân viên phụ trách"
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void refetch()}
          >
            Làm mới
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ spacing: 2, alignItems: { xs: "stretch", md: "center" } }}
        >
          <TextField
            size="small"
            placeholder="Mã booking, biển số, khách hàng..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setPagination((prev) => ({
                  ...prev,
                  page: 0,
                }));
                setSearch(searchInput.trim());
              }
            }}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={() => {
              setPagination((prev) => ({
                ...prev,
                page: 0,
              }));
              setSearch(searchInput.trim());
            }}
          >
            Tìm kiếm
          </Button>

          <TextField
            select
            size="small"
            label="Trạng thái"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagination((prev) => ({
                ...prev,
                page: 0,
              }));
            }}
            sx={{ minWidth: 180 }}
            slotProps={{
              select: { native: true },
            }}
          >
            <option value="">Tất cả</option>
            <option value="pending_confirmation">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </TextField>
        </Stack>
      </Paper>

      <Box sx={{ minWidth: 0 }}>
        <HDataGrid
          rows={data?.data ?? []}
          columns={columns}
          loading={isFetching}
          rowCount={data?.total ?? 0}
          paginationMode="server"
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row) => row.id}
          minHeight={520}
        />
      </Box>

      <AssignBookingDialog
        open={!!selected}
        booking={selected}
        onClose={() => setSelected(null)}
        onChanged={() => void refetch()}
      />
    </Stack>
  );
}
