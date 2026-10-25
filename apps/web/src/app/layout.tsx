import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng Kiểm Hộ – Đặt lịch đăng kiểm xe",
  description:
    "Đặt lịch đăng kiểm xe trực tuyến và hỗ trợ đăng kiểm hộ theo yêu cầu.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppProviders>
          <CustomerLayout>{children}</CustomerLayout>
        </AppProviders>
      </body>
    </html>
  );
}
