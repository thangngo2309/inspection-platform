"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  ArrowRight,
  CalendarCheck2,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  History,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";

import { getAuth } from "@/lib/auth";

import {
  customerAccountRepository as repo,
  type MyBooking,
  type MyVehicle,
} from "@/lib/repositories/customer-account.repository";

export type AccountMode = "bookings" | "vehicles" | "history";

const navigation = [
  {
    mode: "bookings" as const,
    label: "Booking của tôi",
    href: "/account/bookings",
    icon: CalendarCheck2,
  },
  {
    mode: "vehicles" as const,
    label: "Xe của tôi",
    href: "/account/vehicles",
    icon: CarFront,
  },
  {
    mode: "history" as const,
    label: "Lịch sử đăng kiểm",
    href: "/account/history",
    icon: History,
  },
];

const titles = {
  bookings: {
    title: "Booking của tôi",
    description: "Theo dõi các yêu cầu đăng kiểm liên kết với tài khoản.",
  },
  vehicles: {
    title: "Xe của tôi",
    description: "Các phương tiện từng được đặt lịch bằng tài khoản này.",
  },
  history: {
    title: "Lịch sử đăng kiểm",
    description: "Những booking đã hoàn thành dịch vụ hỗ trợ đăng kiểm.",
  },
};

const statusLabels: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned: "Đã phân công",
  accepted: "Đã tiếp nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
};

const vehicleLabels: Record<string, string> = {
  car: "Ô tô con",
  truck: "Xe tải",
  bus: "Xe khách",
};

function dateText(value: string | null) {
  if (!value) return "—";
  return value.slice(0, 10).split("-").reverse().join("/");
}

function money(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}

function Status({ status }: { status: string }) {
  const className =
    status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "cancelled" || status === "rejected"
      ? "bg-red-50 text-red-700"
      : status === "pending_confirmation"
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function BookingCard({ booking }: { booking: MyBooking }) {
  return (
    <Link
      href={`/account/bookings/${encodeURIComponent(booking.id)}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Mã booking</p>
          <h3 className="mt-1 break-all text-base font-extrabold text-blue-700">
            {booking.bookingCode}
          </h3>
        </div>

        <Status status={booking.status} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Biển số</p>
          <p className="mt-1 font-bold text-slate-900">
            {booking.licensePlate}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Ngày hẹn</p>
          <p className="mt-1 font-semibold text-slate-900">
            {dateText(booking.slotDate)}
            {" · "}
            {booking.startTime?.slice(0, 5) ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Trung tâm</p>
          <p className="mt-1 font-semibold text-slate-900">
            {booking.centerName ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Phí dịch vụ</p>
          <p className="mt-1 font-bold text-slate-900">
            {money(booking.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {booking.staffName
            ? `Nhân viên: ${booking.staffName}`
            : "Chưa phân công nhân viên"}
        </span>

        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700">
          Xem chi tiết <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function VehicleCard({ vehicle }: { vehicle: MyVehicle }) {
  return (
    <Link
      href={`/account/vehicles/${encodeURIComponent(vehicle.id)}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <CarFront size={25} />
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {vehicle.bookingCount} booking
        </span>
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-slate-900">
        {vehicle.licensePlate}
      </h3>

      <p className="mt-2 text-sm text-slate-600">
        {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
          vehicleLabels[vehicle.vehicleType ?? ""] ||
          "Chưa có thông tin chi tiết"}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Booking gần nhất: {dateText(vehicle.lastBookingAt)}
        </p>
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
        Xem lịch sử xe <ArrowRight size={16} />
      </span>
    </Link>
  );
}

export function AccountWorkspace({ mode }: { mode: AccountMode }) {
  const router = useRouter();

  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const isAuthenticated = Boolean(getAuth()?.accessToken);

    setAuthenticated(isAuthenticated);
    setAuthReady(true);

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [router]);

  const bookingsQuery = useQuery({
    queryKey: ["my-account", "bookings", page],
    queryFn: () => repo.bookings(page),
    enabled: authenticated && mode === "bookings",
  });

  const vehiclesQuery = useQuery({
    queryKey: ["my-account", "vehicles"],
    queryFn: () => repo.vehicles(),
    enabled: authenticated && mode === "vehicles",
  });

  const historyQuery = useQuery({
    queryKey: ["my-account", "history", page],
    queryFn: () => repo.history(page),
    enabled: authenticated && mode === "history",
  });

  const currentQuery =
    mode === "bookings"
      ? bookingsQuery
      : mode === "vehicles"
      ? vehiclesQuery
      : historyQuery;

  if (!authReady || !authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 size={22} className="animate-spin" />
        Đang kiểm tra tài khoản...
      </div>
    );
  }

  const pageData =
    mode === "bookings"
      ? bookingsQuery.data
      : mode === "history"
      ? historyQuery.data
      : undefined;

  const bookings =
    mode === "bookings"
      ? bookingsQuery.data?.data ?? []
      : historyQuery.data?.data ?? [];

  const vehicles = vehiclesQuery.data ?? [];

  const totalPages = Math.ceil((pageData?.total ?? 0) / 20);

  return (
    <main className="min-h-[75vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              <CircleUserRound size={18} />
              Tài khoản khách hàng
            </span>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
              {titles[mode].title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {titles[mode].description}
            </p>
          </div>

          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            Đặt lịch mới
          </Link>
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = mode === item.mode;

            return (
              <Link
                key={item.mode}
                href={item.href}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                ].join(" ")}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {currentQuery.isPending ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : currentQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              Không tải được dữ liệu tài khoản.
            </p>
            <button
              type="button"
              onClick={() => void currentQuery.refetch()}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-700"
            >
              <RefreshCw size={17} />
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {mode === "vehicles" ? (
              vehicles.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map((vehicle: any) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <EmptyState mode={mode} />
              )
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <EmptyState mode={mode} />
            )}

            {mode !== "vehicles" && totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-slate-200 bg-white p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-semibold text-slate-600">
                  Trang {page}/{totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-slate-200 bg-white p-2 disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-900">
          Các mục này hiển thị lịch liên kết với tài khoản. Những booking đặt
          khi chưa đăng nhập chưa tự động được liên kết. Lịch sử hoàn thành dịch
          vụ hỗ trợ không thay thế kết quả kiểm định chính thức.
        </div>
      </div>
    </main>
  );
}

function EmptyState({ mode }: { mode: AccountMode }) {
  const Icon =
    mode === "vehicles"
      ? CarFront
      : mode === "history"
      ? History
      : CalendarCheck2;

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={30} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        {mode === "vehicles"
          ? "Chưa có phương tiện"
          : mode === "history"
          ? "Chưa có lịch sử hoàn thành"
          : "Chưa có booking"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
        {mode === "history"
          ? "Các booking đã hoàn thành dịch vụ hỗ trợ sẽ xuất hiện tại đây."
          : "Khi đặt lịch bằng tài khoản đã đăng nhập, dữ liệu liên quan sẽ xuất hiện ở mục này."}
      </p>

      <Link
        href="/booking"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
      >
        Đặt lịch đăng kiểm
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
