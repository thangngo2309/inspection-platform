"use client";

import Link from "next/link";
import { Box, Chip, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { HDataGrid } from "@/components/common/HDataGrid";
import type { BookingHistoryRow } from "@/lib/repositories/customer-vehicles.repository";

const statuses: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned: "Đã phân công",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
};

const money = (value: string) => `${Number(value).toLocaleString("vi-VN")} đ`;

export function BookingHistoryGrid({
  rows,
  showCustomer = false,
}: {
  rows: BookingHistoryRow[];
  showCustomer?: boolean;
}) {
  const columns: GridColDef<BookingHistoryRow>[] = [
    {
      field: "bookingCode",
      headerName: "Booking",
      minWidth: 170,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.bookingCode}
        </Typography>
      ),
    },
    {
      field: "licensePlate",
      headerName: "Biển số",
      minWidth: 130,
      renderCell: ({ row }) => (
        <Link
          href={`/vehicles/${encodeURIComponent(
            row.licensePlate.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
          )}`}
          style={{ color: "inherit", fontWeight: 700 }}
        >
          {row.licensePlate}
        </Link>
      ),
    },
    ...(showCustomer
      ? [
          {
            field: "customerName",
            headerName: "Người liên hệ",
            minWidth: 180,
            flex: 1,
          } satisfies GridColDef<BookingHistoryRow>,
        ]
      : []),
    {
      field: "slotDate",
      headerName: "Ngày hẹn",
      minWidth: 125,
      valueFormatter: (value: string | null) =>
        value ? value.slice(0, 10).split("-").reverse().join("/") : "—",
    },
    {
      field: "startTime",
      headerName: "Giờ",
      minWidth: 85,
      valueFormatter: (value: string | null) => value?.slice(0, 5) ?? "—",
    },
    {
      field: "centerName",
      headerName: "Trung tâm",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "serviceName",
      headerName: "Dịch vụ",
      minWidth: 160,
    },
    {
      field: "staffName",
      headerName: "Nhân viên",
      minWidth: 150,
      valueFormatter: (value: string | null) => value || "—",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      minWidth: 155,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={statuses[row.status] ?? row.status}
          color={
            row.status === "completed"
              ? "success"
              : row.status === "cancelled" || row.status === "rejected"
              ? "error"
              : row.status === "pending_confirmation"
              ? "warning"
              : "info"
          }
        />
      ),
    },
    {
      field: "totalAmount",
      headerName: "Phí dịch vụ",
      minWidth: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: string) => money(value),
    },
  ];

  return (
    <Box sx={{ minWidth: 0 }}>
      <HDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row: BookingHistoryRow) => row.id}
        minHeight={rows.length ? 420 : 220}
      />
    </Box>
  );
}
