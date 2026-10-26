"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  CarFront,
  CalendarDays,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { HAccountActions } from "../common/HAccountActions";

const navigation = [
  { label: "Trang chủ", href: "/" },
  { label: "Đặt lịch", href: "/booking" },
  { label: "Tra cứu", href: "/lookup" },
  { label: "Hướng dẫn", href: "/guide" },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-700 p-2 text-white">
              <CarFront size={24} />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-extrabold text-slate-900">
                Đăng Kiểm Hộ
              </div>
              <div className="text-xs text-slate-500">
                Đặt lịch đăng kiểm xe trực tuyến
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/lookup"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <Search size={17} />
              Tra cứu lịch
            </Link>

            <Link
              href="/booking"
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <CalendarDays size={17} />
              Đặt lịch ngay
            </Link>

            <HAccountActions />
          </div>

          <button
            type="button"
            aria-label="Mở menu"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CarFront size={22} className="text-blue-700" />
              Đăng Kiểm Hộ
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Nền tảng đặt lịch và hỗ trợ đưa xe đến trung tâm đăng kiểm theo
              yêu cầu.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">Dịch vụ</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <p>Đặt lịch đăng kiểm</p>
              <p>Nhận xe và đăng kiểm hộ</p>
              <p>Tra cứu lịch đặt</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">Hỗ trợ khách hàng</h3>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Phone size={16} />
              Thông tin liên hệ sẽ cập nhật
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={16} />
              Dịch vụ minh bạch, đúng quy định
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © 2026 Đăng Kiểm Hộ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
