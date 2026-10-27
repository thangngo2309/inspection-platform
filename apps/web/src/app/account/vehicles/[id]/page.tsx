"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  History,
  Loader2,
} from "lucide-react";

import {
  myVehiclesRepository,
  getMyVehicleBookings,
} from "@/lib/repositories/my-vehicles.repository";

const statusLabels: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned: "Đã phân công",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
};

function dateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export default function MyVehicleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const vehicleQuery = useQuery({
    queryKey: ["my-vehicle", id],
    queryFn: () => myVehiclesRepository.get(id),
    enabled: Boolean(id),
  });

  const historyQuery = useQuery({
    queryKey: ["my-vehicle-bookings", id],
    queryFn: () => getMyVehicleBookings(id),
    enabled: Boolean(id),
  });

  if (vehicleQuery.isPending) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-700" />
      </div>
    );
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Không tìm thấy phương tiện trong tài khoản.
        </div>
      </div>
    );
  }

  const vehicle = vehicleQuery.data;
  const bookings = historyQuery.data ?? [];

  const fields = [
    ["Biển số xe", vehicle.licensePlate],
    ["Loại xe", vehicle.vehicleType],
    ["Hãng xe", vehicle.brand],
    ["Dòng xe", vehicle.model],
    ["Năm sản xuất", vehicle.manufactureYear],
    ["Số chỗ ngồi", vehicle.seats],
    ["Số khung", vehicle.chassisNumber],
    ["Số máy", vehicle.engineNumber],
    ["Tải trọng (kg)", vehicle.payloadKg],
    ["Hạn đăng kiểm", vehicle.inspectionExpiryDate],
    ["Hạn bảo hiểm", vehicle.insuranceExpiryDate],
  ];

  return (
    <main className="min-h-[75vh] bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <Link
          href="/account/vehicles"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
        >
          <ArrowLeft size={17} />
          Xe của tôi
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <CarFront size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {vehicle.licensePlate}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Hồ sơ phương tiện đã lưu
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {value === null || value === undefined || value === ""
                    ? "—"
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <History size={22} className="text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Lịch sử đặt đăng kiểm
            </h2>
          </div>

          {historyQuery.isPending ? (
            <div className="flex items-center gap-2 py-8 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Đang tải lịch sử...
            </div>
          ) : historyQuery.isError ? (
            <p className="mt-5 text-sm text-red-600">
              Không tải được lịch sử booking.
            </p>
          ) : bookings.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              Xe này chưa có booking liên kết.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/account/bookings/${booking.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-blue-700">
                      {booking.bookingCode}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.serviceName}
                      {" · "}
                      {dateTime(booking.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {statusLabels[booking.status] ?? booking.status}
                    </p>
                  </div>

                  <ArrowRight size={18} className="text-blue-700" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Lịch sử hiển thị các booking được liên kết với hồ sơ phương tiện này.
          Booking đặt trước khi lưu xe sẽ không tự động được gán vào hồ sơ. Việc
          hoàn thành booking không đồng nghĩa phương tiện đã đạt kiểm định.
        </p>
      </div>
    </main>
  );
}
