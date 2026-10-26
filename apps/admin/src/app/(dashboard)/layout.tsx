"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { HLoading } from "@/components/common/HLoading";
import { authRepository } from "@/lib/repositories/auth.repository";
import { clearAuth, getAuth, isAdminRole } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const auth = getAuth();

      if (!auth || !isAdminRole(auth.user.role)) {
        clearAuth();
        router.replace("/login");
        return;
      }

      try {
        const user = await authRepository.me();

        if (!isAdminRole(user.role)) {
          throw new Error("Không có quyền quản trị");
        }

        if (active) setAuthorized(true);
      } catch {
        clearAuth();
        router.replace("/login");
      }
    }

    void checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  if (!authorized) {
    return <HLoading text="Đang kiểm tra phiên đăng nhập..." />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
