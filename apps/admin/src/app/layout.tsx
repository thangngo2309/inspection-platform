import type { Metadata } from "next";

import { ThemeRegistry } from "@/theme/ThemeRegistry";

import "./globals.css";

export const metadata: Metadata = {
  title: "Inspection Admin",
  description: "Hệ thống quản lý đăng kiểm xe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
