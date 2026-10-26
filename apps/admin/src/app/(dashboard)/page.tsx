"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import type { GridColDef } from "@mui/x-data-grid";

import {
  Add,
  ApartmentOutlined,
  ArrowForward,
  AssignmentIndOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlineOutlined,
  DirectionsCarOutlined,
  EventAvailableOutlined,
  GroupsOutlined,
  PendingActionsOutlined,
  RefreshOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";

import { bookingRepository } from "@/lib/repositories/booking.repository";

import { catalogRepository } from "@/lib/repositories/catalog.repository";

import { staffManagementRepository } from "@/lib/repositories/staff-management.repository";

import type { AdminBookingRow } from "@inspection/contracts";

// ======================================================
// CONSTANTS
// ======================================================

const BOOKING_PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned: "Đã phân công",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
};

const TERMINAL_STATUSES = ["completed", "cancelled", "rejected"];

// ======================================================
// HELPERS
// ======================================================

function formatNumber(value: number | undefined) {
  if (value === undefined) return "—";

  return value.toLocaleString("vi-VN");
}

function formatMoney(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `${amount.toLocaleString("vi-VN")} đ`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const datePart = String(value).slice(0, 10);

  const parts = datePart.split("-");

  if (parts.length !== 3) {
    return datePart;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(value?: string | null) {
  if (!value) return "—";

  return String(value).slice(0, 5);
}

function isPendingAssignment(row: AdminBookingRow) {
  return !row.staffId && !TERMINAL_STATUSES.includes(row.status);
}

function getStatusColor(
  status: string
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "pending_confirmation":
      return "warning";

    case "confirmed":
    case "assigned":
      return "info";

    case "in_progress":
      return "info";

    case "completed":
      return "success";

    case "cancelled":
    case "rejected":
      return "error";

    default:
      return "default";
  }
}

// ======================================================
// COMPONENTS
// ======================================================

type StatCardProps = {
  title: string;
  value?: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  background: string;
  loading?: boolean;
  href?: string;
};

function StatCard({
  title,
  value,
  description,
  icon,
  color,
  background,
  loading,
  href,
}: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        transition: "border-color .2s, box-shadow .2s",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 6px 24px rgba(15,23,42,.05)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            spacing: 2,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>

            {loading ? (
              <Skeleton
                variant="text"
                width={95}
                height={55}
                sx={{ my: 0.5 }}
              />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mt: 1,
                  letterSpacing: "-0.04em",
                  color: "text.primary",
                }}
              >
                {formatNumber(value)}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.75 }}
            >
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 2.5,
              color,
              bgcolor: background,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {href && (
          <Button
            component={Link}
            href={href}
            size="small"
            endIcon={<ArrowForward fontSize="small" />}
            sx={{
              mt: 2,
              px: 0,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Xem chi tiết
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSectionHeader({
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        mb: 2.5,
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        spacing: 1.5,
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 750, fontSize: 18 }}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {href && (
        <Button
          component={Link}
          href={href}
          size="small"
          endIcon={<ArrowForward />}
        >
          {linkLabel}
        </Button>
      )}
    </Stack>
  );
}

function QuickAction({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.5,
        textDecoration: "none",
        color: "inherit",
        transition: "all .2s",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: "action.hover",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>

      <ArrowForward
        sx={{
          color: "text.disabled",
          fontSize: 18,
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function AdminHomePage() {
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  // ----------------------------------------------------
  // TOTAL BOOKINGS
  // ----------------------------------------------------

  const bookingsCountQuery = useQuery({
    queryKey: ["dashboard", "booking-count"],
    queryFn: () =>
      bookingRepository.list({
        page: 1,
        limit: 1,
      }),
    staleTime: 30_000,
  });

  // ----------------------------------------------------
  // PENDING BOOKINGS
  // ----------------------------------------------------

  const pendingQuery = useQuery({
    queryKey: ["dashboard", "pending-count"],
    queryFn: () =>
      bookingRepository.list({
        page: 1,
        limit: 1,
        status: "pending_confirmation",
      }),
    staleTime: 30_000,
  });

  // ----------------------------------------------------
  // RECENT BOOKINGS
  // ----------------------------------------------------

  const recentQuery = useQuery({
    queryKey: ["dashboard", "recent-bookings"],
    queryFn: () =>
      bookingRepository.list({
        page: 1,
        limit: BOOKING_PAGE_SIZE,
      }),
    staleTime: 30_000,
  });

  // ----------------------------------------------------
  // STAFF COUNT
  // ----------------------------------------------------

  const staffQuery = useQuery({
    queryKey: ["dashboard", "staff-count"],
    queryFn: () =>
      staffManagementRepository.list({
        page: 1,
        limit: 1,
      }),
    staleTime: 60_000,
  });

  // ----------------------------------------------------
  // CENTER COUNT
  // ----------------------------------------------------

  const centersQuery = useQuery({
    queryKey: ["dashboard", "center-count"],
    queryFn: () =>
      catalogRepository.centers.list({
        page: 1,
        limit: 1,
      }),
    staleTime: 60_000,
  });

  // ----------------------------------------------------
  // DERIVED DATA
  // ----------------------------------------------------

  const recentBookings = useMemo(
    () => recentQuery.data?.data ?? [],
    [recentQuery.data]
  );

  const unassignedRecent = useMemo(
    () => recentBookings.filter(isPendingAssignment),
    [recentBookings]
  );

  const stats = [
    {
      title: "Tổng booking",
      value: bookingsCountQuery.data?.total,
      description: "Tất cả lịch đặt trên hệ thống",
      icon: <DirectionsCarOutlined />,
      color: "#1d4ed8",
      background: "#eff6ff",
      loading: bookingsCountQuery.isPending,
      href: "/bookings",
    },
    {
      title: "Chờ xác nhận",
      value: pendingQuery.data?.total,
      description: "Booking đang chờ xử lý",
      icon: <PendingActionsOutlined />,
      color: "#d97706",
      background: "#fffbeb",
      loading: pendingQuery.isPending,
      href: "/bookings",
    },
    {
      title: "Nhân viên",
      value: staffQuery.data?.total,
      description: "Tổng hồ sơ nhân viên",
      icon: <GroupsOutlined />,
      color: "#059669",
      background: "#ecfdf5",
      loading: staffQuery.isPending,
      href: "/staff",
    },
    {
      title: "Trung tâm đăng kiểm",
      value: centersQuery.data?.total,
      description: "Tổng trung tâm trong hệ thống",
      icon: <ApartmentOutlined />,
      color: "#7c3aed",
      background: "#f5f3ff",
      loading: centersQuery.isPending,
      href: "/centers",
    },
  ];

  const hasError =
    bookingsCountQuery.isError ||
    pendingQuery.isError ||
    recentQuery.isError ||
    staffQuery.isError ||
    centersQuery.isError;

  // ----------------------------------------------------
  // REFRESH
  // ----------------------------------------------------

  const refreshDashboard = async () => {
    setRefreshing(true);

    try {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast.success("Đã làm mới dữ liệu Dashboard");
    } catch {
      toast.error("Không thể làm mới dữ liệu");
    } finally {
      setRefreshing(false);
    }
  };

  // ----------------------------------------------------
  // GRID COLUMNS
  // ----------------------------------------------------

  const columns = useMemo<GridColDef<AdminBookingRow>[]>(
    () => [
      {
        field: "code",
        headerName: "Mã booking",
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {row.code}
          </Typography>
        ),
      },
      {
        field: "customer",
        headerName: "Khách hàng",
        minWidth: 170,
        flex: 1,
        renderCell: ({ row }) => (
          <Stack
            sx={{ height: "100%", spacing: 0.25, justifyContent: "center" }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.customer}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {row.phone}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "plate",
        headerName: "Biển số xe",
        minWidth: 130,
        renderCell: ({ value }) => (
          <Chip
            label={String(value ?? "—")}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
            }}
          />
        ),
      },
      {
        field: "centerName",
        headerName: "Trung tâm",
        minWidth: 185,
        flex: 1,
        valueFormatter: (value: string | null) => value || "—",
      },
      {
        field: "slotDate",
        headerName: "Ngày đăng kiểm",
        minWidth: 140,
        valueFormatter: (value: string | null) => formatDate(value),
      },
      {
        field: "startTime",
        headerName: "Giờ",
        minWidth: 85,
        valueFormatter: (value: string | null) => formatTime(value),
      },
      {
        field: "staffName",
        headerName: "Người phụ trách",
        minWidth: 175,
        renderCell: ({ row }) =>
          row.staffId ? (
            <Chip
              label={row.staffName || "Đã phân công"}
              size="small"
              color="success"
              variant="outlined"
            />
          ) : TERMINAL_STATUSES.includes(row.status) ? (
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          ) : (
            <Chip
              label="Chưa phân công"
              size="small"
              color="warning"
              variant="outlined"
            />
          ),
      },
      {
        field: "status",
        headerName: "Trạng thái",
        minWidth: 145,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            color={getStatusColor(String(value))}
            label={STATUS_LABELS[String(value)] ?? String(value)}
          />
        ),
      },
      {
        field: "totalAmount",
        headerName: "Phí dịch vụ",
        minWidth: 145,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value: string | number) => formatMoney(value),
      },
      {
        field: "actions",
        headerName: "",
        minWidth: 65,
        width: 65,
        sortable: false,
        filterable: false,
        renderCell: () => (
          <Tooltip title="Mở quản lý booking">
            <IconButton
              component={Link}
              href="/bookings"
              size="small"
              color="primary"
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <Stack spacing={3}>
      {/* ============================================= */}
      {/* PAGE HEADER */}
      {/* ============================================= */}

      <HPageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi hoạt động đặt lịch đăng kiểm và điều phối nhân viên."
        actions={
          <Stack
            direction="row"
            sx={{ spacing: 1, flexWrap: "wrap" }}
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={
                refreshing ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshOutlined />
                )
              }
              disabled={refreshing}
              onClick={() => void refreshDashboard()}
            >
              Làm mới
            </Button>

            <Button
              component={Link}
              href="/bookings"
              variant="contained"
              startIcon={<EventAvailableOutlined />}
            >
              Quản lý booking
            </Button>
          </Stack>
        }
      />

      {/* ============================================= */}
      {/* ERROR WARNING */}
      {/* ============================================= */}

      {hasError && (
        <Alert
          severity="warning"
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => void refreshDashboard()}
            >
              Thử lại
            </Button>
          }
        >
          Một số dữ liệu chưa tải được từ API. Các chỉ số không có dữ liệu sẽ
          hiển thị dấu gạch ngang.
        </Alert>
      )}

      {/* ============================================= */}
      {/* STATISTICS */}
      {/* ============================================= */}

      <Grid container spacing={2}>
        {stats.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* ============================================= */}
      {/* OPERATION NOTICE */}
      {/* ============================================= */}

      {unassignedRecent.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmberOutlined />}
          action={
            <Button
              component={Link}
              href="/bookings"
              color="inherit"
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Xử lý
            </Button>
          }
          sx={{
            borderRadius: 2.5,
            alignItems: "center",
          }}
        >
          Trong {recentBookings.length} booking mới nhất đang hiển thị, có{" "}
          <strong>{unassignedRecent.length} booking</strong> chưa được phân công
          nhân viên phụ trách.
        </Alert>
      )}

      {/* ============================================= */}
      {/* RECENT BOOKINGS */}
      {/* ============================================= */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3 },
            "&:last-child": {
              pb: { xs: 2, sm: 3 },
            },
          }}
        >
          <DashboardSectionHeader
            title="Booking mới nhất"
            description="Các yêu cầu đặt lịch vừa được ghi nhận trên hệ thống."
            href="/bookings"
          />

          <HDataGrid
            rows={recentBookings}
            columns={columns}
            getRowId={(row: AdminBookingRow) => row.id}
            loading={recentQuery.isFetching}
            minHeight={460}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 10,
                },
              },
            }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* ============================================= */}
      {/* OPERATIONS & QUICK ACTIONS */}
      {/* ============================================= */}

      <Grid container spacing={2}>
        {/* LEFT */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <DashboardSectionHeader
                title="Quản lý vận hành"
                description="Truy cập nhanh các chức năng quản trị."
              />

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Quản lý booking"
                    description="Kiểm tra và phân công"
                    icon={<AssignmentIndOutlined />}
                    href="/bookings"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Khung giờ đăng kiểm"
                    description="Thiết lập lịch và hạn mức"
                    icon={<CalendarMonthOutlined />}
                    href="/slots"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Bố trí nhân viên"
                    description="Phân bổ nhân sự theo giờ"
                    icon={<ScheduleOutlined />}
                    href="/staff-schedule"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Quản lý nhân viên"
                    description="Tài khoản và hồ sơ nhân viên"
                    icon={<GroupsOutlined />}
                    href="/staff"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Trung tâm đăng kiểm"
                    description="Quản lý trung tâm liên kết"
                    icon={<ApartmentOutlined />}
                    href="/centers"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <QuickAction
                    title="Dịch vụ"
                    description="Cấu hình dịch vụ và giá"
                    icon={<Add />}
                    href="/services"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <DashboardSectionHeader
                title="Tình trạng điều phối"
                description="Tổng quan xử lý booking gần đây."
              />

              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    sx={{ spacing: 1.5, alignItems: "center" }}
                  >
                    <PendingActionsOutlined color="warning" />

                    <Typography variant="body2">Chờ xác nhận</Typography>
                  </Stack>

                  {pendingQuery.isPending ? (
                    <Skeleton width={42} />
                  ) : (
                    <Chip
                      label={formatNumber(pendingQuery.data?.total)}
                      color="warning"
                      size="small"
                    />
                  )}
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    sx={{ spacing: 1.5, alignItems: "center" }}
                  >
                    <AssignmentIndOutlined color="info" />

                    <Typography variant="body2">
                      Chưa phân công trong {BOOKING_PAGE_SIZE} booking mới nhất
                    </Typography>
                  </Stack>

                  {recentQuery.isPending ? (
                    <Skeleton width={42} />
                  ) : (
                    <Chip
                      label={unassignedRecent.length}
                      color={
                        unassignedRecent.length > 0 ? "warning" : "success"
                      }
                      size="small"
                    />
                  )}
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    sx={{ spacing: 1.5, alignItems: "center" }}
                  >
                    <CheckCircleOutlineOutlined color="success" />

                    <Typography variant="body2">
                      Đã phân công trong {BOOKING_PAGE_SIZE} booking mới nhất
                    </Typography>
                  </Stack>

                  {recentQuery.isPending ? (
                    <Skeleton width={42} />
                  ) : (
                    <Chip
                      label={
                        recentBookings.filter((item) => Boolean(item.staffId))
                          .length
                      }
                      color="success"
                      size="small"
                    />
                  )}
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  <DirectionsCarOutlined
                    sx={{
                      fontSize: 18,
                      verticalAlign: "middle",
                      mr: 1,
                    }}
                  />
                  Nguyên tắc phân công
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  Mỗi booking giữ một suất của khung giờ. Một nhân viên chỉ được
                  phụ trách một xe trong cùng khung giờ. Khi đã hết năng lực
                  nhân sự, hệ thống không nhận thêm booking.
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/staff-schedule"
                variant="outlined"
                fullWidth
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
              >
                Xem lịch bố trí nhân viên
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================= */}
      {/* FOOTER */}
      {/* ============================================= */}

      <Box sx={{ pb: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          Đăng Kiểm Hộ · Hệ thống quản lý lịch đăng kiểm và điều phối phương
          tiện
        </Typography>
      </Box>
    </Stack>
  );
}
