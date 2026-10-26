"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";

import {
  AdminPanelSettingsOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@mui/icons-material";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";
import { authRepository } from "@/lib/repositories/auth.repository";
import { saveAuth } from "@/lib/auth";

type LoginForm = {
  phone: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const methods = useForm<LoginForm>({
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);

    try {
      const data = await authRepository.login(values);

      saveAuth(data);
      toast.success("Đăng nhập thành công");

      router.replace("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f1f5f9",
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 430,
          borderRadius: 3,
          boxShadow: "0 16px 50px rgba(15,23,42,0.07)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack sx={{ mb: 4, alignItems: "center", spacing: 1.5 }}>
            <Box
              sx={{
                width: 62,
                height: 62,
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
              }}
            >
              <AdminPanelSettingsOutlined sx={{ fontSize: 34 }} />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 800, textAlign: "center" }}
            >
              Đăng Kiểm Hộ
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Đăng nhập hệ thống quản trị
            </Typography>
          </Stack>

          <HForm methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              <HTextField<LoginForm>
                name="phone"
                label="Số điện thoại"
                autoComplete="username"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <HTextField<LoginForm>
                name="password"
                label="Mật khẩu"
                type="password"
                autoComplete="current-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                variant="contained"
                type="submit"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Stack>
          </HForm>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 4, display: "block", textAlign: "center" }}
          >
            Chỉ dành cho tài khoản được cấp quyền quản trị
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
