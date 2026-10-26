"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Tooltip,
} from "@mui/material";

import {
  Menu as MenuIcon,
  DashboardOutlined,
  EventNoteOutlined,
  PeopleOutlineOutlined,
  DirectionsCarOutlined,
  ApartmentOutlined,
  EngineeringOutlined,
  SettingsOutlined,
  ChevronLeft,
  MiscellaneousServicesOutlined,
  AccessTimeOutlined,
  EventAvailableOutlined,
} from "@mui/icons-material";
import { HAccountMenu } from "../common/HAccountMenu";

const DRAWER_WIDTH = 260;

const navigation = [
  {
    label: "Tổng quan",
    path: "/",
    icon: <DashboardOutlined />,
  },
  {
    label: "Booking",
    path: "/bookings",
    icon: <EventNoteOutlined />,
  },
  {
    label: "Khách hàng",
    path: "/customers",
    icon: <PeopleOutlineOutlined />,
  },
  {
    label: "Phương tiện",
    path: "/vehicles",
    icon: <DirectionsCarOutlined />,
  },
  {
    label: "Trung tâm đăng kiểm",
    path: "/centers",
    icon: <ApartmentOutlined />,
  },
  {
    label: "Nhân viên",
    path: "/staff",
    icon: <EngineeringOutlined />,
  },
  {
    label: "Bố trí nhân viên",
    path: "/staff-schedule",
    icon: <EventAvailableOutlined />,
  },
  {
    label: "Dịch vụ",
    path: "/services",
    icon: <MiscellaneousServicesOutlined />,
  },
  {
    label: "Khung giờ đăng kiểm",
    path: "/slots",
    icon: <AccessTimeOutlined />,
  },
  {
    label: "Cấu hình",
    path: "/settings",
    icon: <SettingsOutlined />,
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const drawerWidth = isDesktop && collapsed ? 76 : DRAWER_WIDTH;

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Toolbar
        sx={{
          gap: 1,
          justifyContent: collapsed && isDesktop ? "center" : "space-between",
        }}
      >
        {(!collapsed || !isDesktop) && (
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            ĐĂNG KIỂM HỘ
          </Typography>
        )}

        {isDesktop && (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuIcon /> : <ChevronLeft />}
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {navigation.map((item) => {
          const selected =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(`${item.path}/`));

          return (
            <Tooltip
              key={item.path}
              title={collapsed && isDesktop ? item.label : ""}
              placement="right"
            >
              <ListItemButton
                selected={selected}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 44,
                  justifyContent:
                    collapsed && isDesktop ? "center" : "flex-start",
                  px: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && isDesktop ? 0 : 40,
                    color: selected ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {(!collapsed || !isDesktop) && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 14,
                          fontWeight: selected ? 700 : 500,
                        },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        {(!collapsed || !isDesktop) && (
          <Typography variant="caption" color="text.secondary">
            Inspection Platform © 2026
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              flexGrow: 1,
              ml: isDesktop ? `${drawerWidth}px` : 0,
              transition: "margin 0.2s",
            }}
          >
            Hệ thống quản lý đăng kiểm
          </Typography>

          <Stack direction="row" sx={{ alignItems: "center", spacing: 1 }}>
            <HAccountMenu />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: "width 0.2s",
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.2s",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
