"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Add,
  EventAvailable,
  DirectionsCar,
  Groups,
  Apartment,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { HDataGrid } from "@/components/common/HDataGrid";
import { HPageHeader } from "@/components/common/HPageHeader";
import { HConfirmDialog } from "@/components/common/HConfirmDialog";
import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";
import { HSelect } from "@/components/forms/HSelect";

type SampleForm = {
  fullName: string;
  phone: string;
  service: string;
};

type SampleBooking = {
  id: string;
  code: string;
  customer: string;
  plate: string;
  status: string;
};

const sampleRows: SampleBooking[] = [
  {
    id: "1",
    code: "DK00001",
    customer: "Nguyễn Văn A",
    plate: "43A-123.45",
    status: "pending",
  },
  {
    id: "2",
    code: "DK00002",
    customer: "Trần Văn B",
    plate: "43B-456.78",
    status: "confirmed",
  },
];

const columns: GridColDef<SampleBooking>[] = [
  { field: "code", headerName: "Mã booking", minWidth: 140 },
  {
    field: "customer",
    headerName: "Khách hàng",
    flex: 1,
    minWidth: 160,
  },
  { field: "plate", headerName: "Biển số", minWidth: 140 },
  {
    field: "status",
    headerName: "Trạng thái",
    minWidth: 160,
    renderCell: ({ value }) => (
      <Chip
        size="small"
        color={value === "confirmed" ? "success" : "warning"}
        label={value === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
      />
    ),
  },
];

const stats = [
  {
    title: "Booking hôm nay",
    value: "—",
    icon: <EventAvailable color="primary" />,
  },
  {
    title: "Phương tiện",
    value: "—",
    icon: <DirectionsCar color="primary" />,
  },
  {
    title: "Khách hàng",
    value: "—",
    icon: <Groups color="primary" />,
  },
  {
    title: "Trung tâm đăng kiểm",
    value: "—",
    icon: <Apartment color="primary" />,
  },
];

export default function AdminHomePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const methods = useForm<SampleForm>({
    defaultValues: {
      fullName: "",
      phone: "",
      service: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: SampleForm) => {
    console.log("Form test:", values);
    toast.success("Form đã được kiểm tra thành công");
    methods.reset();
  };

  return (
    <Stack spacing={3}>
      <HPageHeader
        title="Dashboard"
        description="Tổng quan hệ thống và kiểm tra các component nền tảng"
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setConfirmOpen(true)}
          >
            Test Confirm
          </Button>
        }
      />

      <Grid container spacing={2}>
        {stats.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  {item.icon}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            HDataGrid – Dữ liệu minh họa
          </Typography>

          <HDataGrid rows={sampleRows} columns={columns} minHeight={320} />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            HForm – Kiểm tra React Hook Form
          </Typography>

          <HForm methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2} sx={{ maxWidth: 540 }}>
              <HTextField<SampleForm> name="fullName" label="Họ và tên" />

              <HTextField<SampleForm> name="phone" label="Số điện thoại" />

              <HSelect<SampleForm>
                name="service"
                label="Dịch vụ"
                options={[
                  { label: "Đặt lịch đăng kiểm", value: "booking" },
                  { label: "Đăng kiểm hộ", value: "pickup" },
                ]}
              />

              <Box>
                <Button variant="contained" type="submit">
                  Test HForm
                </Button>
              </Box>
            </Stack>
          </HForm>
        </CardContent>
      </Card>

      <HConfirmDialog
        open={confirmOpen}
        title="Kiểm tra Confirm Dialog"
        message="Bạn có muốn xác nhận thao tác mẫu này không?"
        confirmText="Xác nhận"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast.success("Đã xác nhận");
          setConfirmOpen(false);
        }}
      />
    </Stack>
  );
}
