"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, UserRound } from "lucide-react";

import type { AuthAccount } from "@inspection/contracts";

import { clearAuth, getAuth } from "@/lib/auth";
import { authRepository } from "@/lib/repositories/auth.repository";

export function HAccountActions() {
  const router = useRouter();
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccount(getAuth()?.user ?? null);
    setReady(true);
  }, []);

  const logout = async () => {
    const auth = getAuth();

    try {
      if (auth?.refreshToken) {
        await authRepository.logout(auth.refreshToken);
      }
    } catch {
      // Phiên local vẫn được xóa nếu API tạm thời không khả dụng.
    } finally {
      clearAuth();
      setAccount(null);
      toast.success("Đã đăng xuất");
      router.replace("/login");
    }
  };

  if (!ready) return null;

  if (!account) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <UserRound size={17} />
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-sm font-semibold text-slate-800">
          {account.fullName}
        </div>
        <div className="text-xs text-slate-500">{account.phone}</div>
      </div>

      <button
        type="button"
        onClick={() => void logout()}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <LogOut size={17} />
        Đăng xuất
      </button>
    </div>
  );
}
