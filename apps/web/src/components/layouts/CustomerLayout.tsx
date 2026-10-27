"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  CalendarCheck2,
  CalendarDays,
  CarFront,
  ChevronDown,
  CircleUserRound,
  History,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { HAccountActions } from "../common/HAccountActions";
import { AUTH_CHANGED_EVENT, getAuth } from "@/lib/auth";

const navigation = [
  { label: "Trang chủ", href: "/" },
  { label: "Đặt lịch", href: "/booking" },
  { label: "Tra cứu", href: "/lookup" },
  { label: "Hướng dẫn", href: "/guide" },
];

const accountNavigation = [
  {
    label: "Booking của tôi",
    href: "/account/bookings",
    icon: CalendarCheck2,
  },
  {
    label: "Xe của tôi",
    href: "/account/vehicles",
    icon: CarFront,
  },
  {
    label: "Lịch sử đăng kiểm",
    href: "/account/history",
    icon: History,
  },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Kiểm tra phiên đăng nhập trên client.
  useEffect(() => {
    const syncAuth = () => {
      setAuthenticated(Boolean(getAuth()?.accessToken));
    };
  
    syncAuth();
  
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("focus", syncAuth);
    window.addEventListener("storage", syncAuth);
  
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [pathname]);

  // Đóng menu sau khi điều hướng.
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const isAccountPage = pathname.startsWith("/account");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* LOGO */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl bg-blue-700 p-2 text-white">
              <CarFront size={24} />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-extrabold text-slate-900">
                Đăng Kiểm Hộ
              </div>

              <div className="hidden text-xs text-slate-500 sm:block">
                Đặt lịch đăng kiểm xe trực tuyến
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-5 lg:flex">
            {navigation.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "whitespace-nowrap text-sm font-medium transition",
                    active
                      ? "text-blue-700"
                      : "text-slate-600 hover:text-blue-700",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* ACCOUNT DROPDOWN */}
            {authenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className={[
                    "inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition",
                    isAccountPage
                      ? "text-blue-700"
                      : "text-slate-600 hover:text-blue-700",
                  ].join(" ")}
                >
                  <CircleUserRound size={17} />
                  Tài khoản của tôi
                  <ChevronDown
                    size={15}
                    className={[
                      "transition-transform",
                      accountOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {accountOpen && (
                  <>
                    {/* Click outside */}
                    <button
                      type="button"
                      aria-label="Đóng menu tài khoản"
                      onClick={() => setAccountOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />

                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-3 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Quản lý tài khoản
                        </p>
                      </div>

                      {accountNavigation.map((item) => {
                        const Icon = item.icon;
                        const active = pathname.startsWith(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setAccountOpen(false)}
                            className={[
                              "mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                              active
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-50 hover:text-blue-700",
                            ].join(" ")}
                          >
                            <Icon size={18} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/booking"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <CalendarDays size={17} />
              Đặt lịch ngay
            </Link>

            <HAccountActions />
          </div>

          {/* MOBILE / TABLET ACTIONS */}
          <div className="flex items-center gap-2 lg:hidden">
            <HAccountActions />

            <button
              type="button"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE / TABLET NAVIGATION */}
        {mobileOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 shadow-sm lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "block rounded-xl px-3 py-3 text-sm font-medium transition",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {authenticated && (
                <>
                  <div className="mx-3 my-3 border-t border-slate-100" />

                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <CircleUserRound size={15} />
                    Tài khoản của tôi
                  </div>

                  {accountNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  href="/booking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
                >
                  <CalendarDays size={18} />
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="flex-1">{children}</main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

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
              <Link
                href="/booking"
                className="block transition hover:text-blue-700"
              >
                Đặt lịch đăng kiểm
              </Link>

              <Link
                href="/booking"
                className="block transition hover:text-blue-700"
              >
                Nhận xe và đăng kiểm hộ
              </Link>

              <Link
                href="/lookup"
                className="block transition hover:text-blue-700"
              >
                Tra cứu lịch đặt
              </Link>

              <Link
                href="/guide"
                className="block transition hover:text-blue-700"
              >
                Hướng dẫn sử dụng
              </Link>
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

            <div className="mt-5 text-xs leading-6 text-slate-400">
              Việc đặt lịch và cung cấp dịch vụ phụ thuộc vào xác nhận và điều
              kiện thực tế của các bên.
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
