"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Clock3,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";

import { customerAccountRepository as repo } from "@/lib/repositories/customer-account.repository";

function dateText(value: string | null) {
  return value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
}

export default function MyBookingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isPending, isError } = useQuery({
    queryKey: ["my-account", "booking", id],
    queryFn: () => repo.bookingDetail(id),
    enabled: Boolean(id),
  });

  return (
    <main className="min-h-[75vh] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
        >
          <ArrowLeft size={17} />
          Booking của tôi
        </Link>

        {isPending ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : isError || !data ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-white p-6 text-red-700">
            Không tìm thấy booking hoặc bạn không có quyền xem.
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Mã booking</p>
              <h1 className="mt-2 break-all text-2xl font-extrabold text-blue-700">
                {data.bookingCode}
              </h1>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Trạng thái: {data.status}
              </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  icon: CarFront,
                  label: "Biển số xe",
                  value: data.licensePlate,
                },
                {
                  icon: CalendarDays,
                  label: "Ngày đăng kiểm",
                  value: dateText(data.slotDate),
                },
                {
                  icon: Clock3,
                  label: "Khung giờ",
                  value: `${data.startTime?.slice(0, 5) ?? "—"} – ${
                    data.endTime?.slice(0, 5) ?? "—"
                  }`,
                },
                {
                  icon: MapPin,
                  label: "Trung tâm",
                  value: data.centerName ?? "—",
                },
                {
                  icon: UserRound,
                  label: "Nhân viên phụ trách",
                  value: data.staffName ?? "Chưa phân công",
                },
                {
                  icon: CalendarDays,
                  label: "Dịch vụ",
                  value: data.serviceName,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Icon size={18} className="text-blue-700" />
                      {item.label}
                    </div>
                    <p className="mt-3 font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </section>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm text-blue-800">Phí dịch vụ ghi nhận</p>
              <p className="mt-2 text-2xl font-extrabold text-blue-900">
                {Number(data.totalAmount).toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
