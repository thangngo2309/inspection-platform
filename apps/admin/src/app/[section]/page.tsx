import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";

const sections: Record<string, string> = {
  bookings: "Quản lý Booking",
  customers: "Quản lý khách hàng",
  vehicles: "Quản lý phương tiện",
  centers: "Trung tâm đăng kiểm",
  staff: "Quản lý nhân viên",
  settings: "Cấu hình hệ thống",
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sections[section];

  if (!title) {
    return <Typography color="error">Không tìm thấy trang.</Typography>;
  }

  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Chức năng này sẽ được triển khai sau khi Backend API tương ứng hoàn
        thành.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Button component={Link} href="/" variant="outlined">
          Về Dashboard
        </Button>
      </Box>
    </Paper>
  );
}
