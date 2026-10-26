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
import {
  ArrowBack,
  DirectionsCar,
  History,
  PersonOutlineOutlined,
} from "@mui/icons-material";

import { HPageHeader } from "@/components/common/HPageHeader";
import { BookingHistoryGrid } from "@/components/customer-vehicles/BookingHistoryGrid";
import { customerVehiclesRepository as repo } from "@/lib/repositories/customer-vehicles.repository";

const types: Record<string, string> = {
  car: "Ô tô con",
  truck: "Xe tải",
  bus: "Xe khách",
};

function InfoField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
        {value === null || value === undefined || value === "" ? "—" : value}
      </Typography>
    </Box>
  );
}

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const plate = params.id;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["vehicle-detail", plate],
    queryFn: () => repo.vehicleDetail(plate),
    enabled: Boolean(plate),
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
        Không tải được thông tin phương tiện.
        <Button onClick={() => void refetch()}>Thử lại</Button>
      </Alert>
    );
  }

  const { vehicle, contacts, history } = data;

  return (
    <Stack spacing={3}>
      <HPageHeader
        title={`Phương tiện ${vehicle.licensePlate}`}
        description="Hồ sơ phương tiện và lịch sử đặt lịch đăng kiểm."
        actions={
          <Button
            component={Link}
            href="/vehicles"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Danh sách phương tiện
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
                <DirectionsCar color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Thông tin phương tiện
                </Typography>
              </Stack>

              <Chip
                variant="outlined"
                label={vehicle.licensePlate}
                color="primary"
                sx={{ mt: 2, fontWeight: 800 }}
              />

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <InfoField
                    label="Loại xe"
                    value={
                      types[vehicle.vehicleType ?? ""] ?? vehicle.vehicleType
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField label="Hãng xe" value={vehicle.brand} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField label="Dòng xe" value={vehicle.model} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField
                    label="Năm sản xuất"
                    value={vehicle.manufactureYear}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Số khung" value={vehicle.chassisNumber} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Số máy" value={vehicle.engineNumber} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField
                    label="Tổng booking"
                    value={vehicle.bookingCount}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField
                    label="Booking gần nhất"
                    value={
                      vehicle.lastBookingAt
                        ? new Date(vehicle.lastBookingAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : null
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                <PersonOutlineOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
                Người liên hệ liên quan
              </Typography>

              <Stack spacing={1.5}>
                {contacts.map((contact) => (
                  <Box
                    key={contact.phone}
                    component={Link}
                    href={`/customers/${encodeURIComponent(contact.phone)}`}
                    sx={{
                      display: "block",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {contact.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.phone}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {contact.bookingCount} lượt đặt lịch
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            <History sx={{ verticalAlign: "middle", mr: 1 }} />
            Lịch sử đăng kiểm và đặt lịch
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tổng cộng {history.length} yêu cầu đặt lịch liên quan đến biển số
            này.
          </Typography>

          <BookingHistoryGrid rows={history} showCustomer />
        </CardContent>
      </Card>

      <Alert severity="info">
        Lịch sử trên phản ánh các yêu cầu và trạng thái xử lý booking. Trạng
        thái hoàn thành không tự xác nhận rằng phương tiện đã đạt kiểm định.
      </Alert>
    </Stack>
  );
}
