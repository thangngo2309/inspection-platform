
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

const sections: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  customers: {
    title: "Quản lý khách hàng",
    description:
      "Quản lý thông tin khách hàng, hồ sơ và lịch sử đặt đăng kiểm.",
  },
  vehicles: {
    title: "Quản lý phương tiện",
    description:
      "Theo dõi thông tin xe và các lịch đăng kiểm liên quan.",
  },
  reports: {
    title: "Báo cáo thống kê",
    description:
      "Tổng hợp booking, tình trạng xử lý và hiệu quả hoạt động.",
  },
  settings: {
    title: "Cấu hình hệ thống",
    description:
      "Quản lý các thiết lập vận hành của nền tảng Đăng Kiểm Hộ.",
  },
};

interface SectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function SectionPage({
  params,
}: SectionPageProps) {
  const { section } = await params;

  const current = sections[section];

  if (!current) {
    notFound();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700 }}
        >
          {current.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {current.description}
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Chức năng đang phát triển
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5 }}
          >
            Phân hệ này đã được định nghĩa trong cấu trúc
            Admin và sẽ được triển khai ở giai đoạn tiếp theo.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Link
              href="/"
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="outlined"
                component="span"
              >
                Về Dashboard
              </Button>
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
