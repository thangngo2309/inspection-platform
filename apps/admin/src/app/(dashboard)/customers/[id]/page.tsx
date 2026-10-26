"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, DirectionsCar, History, Person } from "@mui/icons-material";

import { HPageHeader } from "@/components/common/HPageHeader";
import { BookingHistoryGrid } from "@/components/customer-vehicles/BookingHistoryGrid";
import { customerVehiclesRepository as repo } from "@/lib/repositories/customer-vehicles.repository";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const phone = params.id;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["customer-detail", phone],
    queryFn: () => repo.customerDetail(phone),
    enabled: Boolean(phone),
  });

  if (isPending) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Alert severity="error">
        Không tải được thông tin khách hàng.
        <Button onClick={() => void refetch()}>Thử lại</Button>
      </Alert>
    );
  }

  const { customer, vehicles, history } = data;

  return (
    <Stack spacing={3}>
      <HPageHeader
        title={customer.fullName}
        description={`Hồ sơ liên hệ: ${customer.phone}`}
        actions={
          <Button
            component={Link}
            href="/customers"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Danh sách khách hàng
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
                <Person color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Thông tin khách hàng
                </Typography>
              </Stack>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Họ tên gần nhất
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {customer.fullName}
                  </Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Số điện thoại
                  </Typography>
                  <Typography>{customer.phone}</Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Email
                  </Typography>
                  <Typography>{customer.email || "—"}</Typography>
                </Box>

                <Chip
                  sx={{ alignSelf: "flex-start" }}
                  color={customer.hasAccount ? "success" : "default"}
                  label={
                    customer.hasAccount
                      ? "Có tài khoản khách hàng"
                      : "Khách chưa đăng ký"
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                <DirectionsCar sx={{ mr: 1, verticalAlign: "middle" }} />
                Phương tiện liên quan ({vehicles.length})
              </Typography>

              <Stack spacing={1.5}>
                {vehicles.map((vehicle) => (
                  <Box
                    key={vehicle.id}
                    component={Link}
                    href={`/vehicles/${encodeURIComponent(vehicle.id)}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {vehicle.licensePlate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[vehicle.brand, vehicle.model]
                          .filter(Boolean)
                          .join(" ") || "Chưa có thông tin xe"}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={`${vehicle.bookingCount} booking`}
                    />
                  </Box>
                ))}

                {vehicles.length === 0 && (
                  <Typography color="text.secondary">
                    Chưa có xe liên quan qua booking.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <History sx={{ mr: 1, verticalAlign: "middle" }} />
            Lịch sử đặt đăng kiểm ({history.length})
          </Typography>

          <BookingHistoryGrid rows={history} />
        </CardContent>
      </Card>

      <Alert severity="info">
        Các phương tiện được liên kết bằng thông tin người liên hệ trên booking.
        Dữ liệu này không tự xác nhận quyền sở hữu xe.
      </Alert>
    </Stack>
  );
}
