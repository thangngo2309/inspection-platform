"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { toast } from "sonner";

import { clearAuth, getAuth } from "@/lib/auth";
import { authRepository } from "@/lib/repositories/auth.repository";

export function HAccountMenu() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const account = getAuth()?.user;

  const logout = async () => {
    setLoading(true);

    try {
      const auth = getAuth();

      if (auth?.refreshToken) {
        await authRepository.logout(auth.refreshToken);
      }
    } catch {
      toast.warning("Không thể đồng bộ đăng xuất với máy chủ");
    } finally {
      clearAuth();
      setAnchor(null);
      setLoading(false);
      router.replace("/login");
    }
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label="Tài khoản"
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: "primary.main",
            fontSize: 13,
          }}
        >
          {account?.fullName?.slice(0, 2).toUpperCase() ?? "AD"}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 210 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {account?.fullName ?? "Administrator"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {account?.phone}
          </Typography>
        </Box>

        <MenuItem disabled={loading} onClick={() => void logout()}>
          <ListItemIcon>
            {loading ? (
              <CircularProgress size={18} />
            ) : (
              <LogoutOutlined fontSize="small" />
            )}
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </>
  );
}
