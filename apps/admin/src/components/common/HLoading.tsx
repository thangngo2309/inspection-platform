"use client";

import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

interface HLoadingProps {
  loading?: boolean;
  overlay?: boolean;
  text?: string;
  minHeight?: number;
}

export function HLoading({
  loading = true,
  overlay = false,
  text = "Đang tải dữ liệu...",
  minHeight = 200,
}: HLoadingProps) {
  if (!loading) return null;

  const content = (
    <Stack sx={{ spacing: 2, alignItems: "center" }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );

  if (overlay) {
    return (
      <Backdrop
        open={loading}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          bgcolor: "rgba(255,255,255,0.65)",
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </Box>
  );
}
