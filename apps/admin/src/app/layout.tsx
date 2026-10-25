import type { Metadata } from "next";
import { ThemeRegistry } from "@/theme/ThemeRegistry";
import { AppProviders } from "@/providers/AppProviders";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng Kiểm Hộ – Admin",
  description: "Hệ thống quản lý dịch vụ đăng kiểm xe",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>
          <AppProviders>
            <AdminLayout>{children}</AdminLayout>
          </AppProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
