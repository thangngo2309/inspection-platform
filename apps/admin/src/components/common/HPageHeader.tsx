import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface HPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function HPageHeader({ title, description, actions }: HPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        mb: 3,
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        spacing: 2,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {actions && <Box>{actions}</Box>}
    </Stack>
  );
}
