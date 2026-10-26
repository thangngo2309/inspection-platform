
import type { Metadata } from "next";

import { ThemeRegistry } from "@/theme/ThemeRegistry";
import { AppProviders } from "@/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng Kiểm Hộ – Admin",
  description: "Hệ thống quản lý đăng kiểm xe",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>
          <AppProviders>{children}</AppProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
