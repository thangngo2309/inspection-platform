"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  DirectionsCar,
  EventAvailable,
  FactCheck,
  People,
  Settings,
} from "@mui/icons-material";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Inspection Admin
            </Typography>

            <Typography color="text.secondary">
              Hệ thống quản lý đặt lịch và dịch vụ đăng kiểm xe
            </Typography>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                sx={{
                  spacing: 2,
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Management Dashboard
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Giao diện quản trị sử dụng Material UI
                  </Typography>
                </Box>

                <Chip
                  label="MUI hoạt động"
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {[
              {
                title: "Booking",
                description: "Quản lý lịch đăng kiểm",
                icon: <EventAvailable color="primary" />,
              },
              {
                title: "Khách hàng",
                description: "Thông tin khách hàng",
                icon: <People color="primary" />,
              },
              {
                title: "Phương tiện",
                description: "Quản lý danh sách xe",
                icon: <DirectionsCar color="primary" />,
              },
              {
                title: "Trung tâm đăng kiểm",
                description: "Quản lý trung tâm và lịch trống",
                icon: <FactCheck color="primary" />,
              },
              {
                title: "Cấu hình",
                description: "Thiết lập hệ thống",
                icon: <Settings color="primary" />,
              },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: "0.2s",
                    "&:hover": {
                      boxShadow: 3,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>{item.icon}</Box>

                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<EventAvailable />}
            >
              Quản lý Booking
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
