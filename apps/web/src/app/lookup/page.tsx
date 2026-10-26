"use client";

import { useState, type ReactNode } from "react";

import Link from "next/link";
import { useForm } from "react-hook-form";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  FileSearch,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";

import {
  bookingLookupRepository,
  type BookingLookupPayload,
  type BookingLookupResult,
} from "@/lib/repositories/booking-lookup.repository";

// ======================================================
// HELPERS
// ======================================================

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

function money(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `${amount.toLocaleString("vi-VN")} đ`;
}

function dateOnly(value?: string | null) {
  if (!value) return "—";

  const part = String(value).slice(0, 10);
  const segments = part.split("-");

  if (segments.length !== 3) {
    return part;
  }

  return segments.reverse().join("/");
}

function dateTime(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function timeOnly(value?: string | null) {
  return value?.slice(0, 5) || "—";
}

function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return {
        background: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };

    case "cancelled":
    case "rejected":
      return {
        background: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };

    case "pending_confirmation":
      return {
        background: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };

    default:
      return {
        background: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          status?: number;
        };
      }
    ).response;

    if (response?.status === 404) {
      return "Không tìm thấy lịch đặt phù hợp. Vui lòng kiểm tra mã booking và số điện thoại.";
    }

    if (response?.status === 429) {
      return "Bạn đã tra cứu quá nhiều lần. Vui lòng thử lại sau.";
    }
  }

  return "Không thể tra cứu lịch đặt lúc này. Vui lòng thử lại.";
}

// ======================================================
// COMPONENTS
// ======================================================

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = getStatusStyle(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "text-xs font-bold",
        styles.background,
        styles.border,
        styles.text,
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-current" />

      {statusLabels[status] || status}
    </span>
  );
}

// ======================================================
// TRACKING PROGRESS
// ======================================================

function BookingProgress({ result }: { result: BookingLookupResult }) {
  const cancelled =
    result.status === "cancelled" ||
    result.status === "rejected" ||
    Boolean(result.cancelledAt);

  const completed =
    result.status === "completed" || Boolean(result.completedAt);

  const confirmed =
    Boolean(result.confirmedAt) ||
    completed ||
    ["confirmed", "assigned", "accepted", "in_progress"].includes(
      result.status
    );

  const steps = [
    {
      title: "Đã tiếp nhận yêu cầu",
      description: "Hệ thống đã ghi nhận booking.",
      done: true,
    },
    {
      title: "Xác nhận lịch",
      description: "Lịch được xác nhận và xử lý.",
      done: confirmed,
    },
    {
      title: "Hoàn tất dịch vụ",
      description: "Quá trình hỗ trợ đăng kiểm đã hoàn thành.",
      done: completed,
    },
  ];

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <XCircle size={21} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="font-bold text-red-800">
              Yêu cầu đã hủy hoặc bị từ chối
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              Booking này không tiếp tục được xử lý. Bạn có thể tạo yêu cầu mới
              nếu vẫn có nhu cầu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                step.done
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-400",
              ].join(" ")}
            >
              {step.done ? <CheckCircle2 size={19} /> : <Clock3 size={17} />}
            </div>

            {index < steps.length - 1 && (
              <div
                className={[
                  "my-1 h-9 w-0.5",
                  step.done && steps[index + 1].done
                    ? "bg-emerald-300"
                    : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>

          <div className="pb-6 pt-1">
            <p
              className={[
                "text-sm font-bold",
                step.done ? "text-slate-900" : "text-slate-500",
              ].join(" ")}
            >
              {step.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ======================================================
// RESULT
// ======================================================

function BookingResult({
  result,
  onReset,
}: {
  result: BookingLookupResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Mã đặt lịch</p>

            <h2 className="mt-2 break-all text-2xl font-extrabold tracking-tight text-blue-800 sm:text-3xl">
              {result.bookingCode}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Ngày gửi yêu cầu: {dateTime(result.createdAt)}
            </p>
          </div>

          <StatusBadge status={result.status} />
        </div>

        <div className="mt-5 border-t border-blue-100 pt-5">
          <p className="text-sm leading-6 text-slate-600">
            Lịch hẹn và tình trạng xử lý được cập nhật theo thông tin hiện có
            trên hệ thống.
          </p>
        </div>
      </div>

      <SectionCard title="Tiến trình xử lý" icon={<ClipboardCheck size={22} />}>
        <BookingProgress result={result} />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Thông tin phương tiện"
          icon={<CarFront size={22} />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Biển số xe" value={result.licensePlate} />

            <InfoItem
              label="Loại xe"
              value={
                vehicleLabels[result.vehicleType || ""] || result.vehicleType
              }
            />

            <InfoItem label="Hãng xe" value={result.brand} />

            <InfoItem label="Dòng xe" value={result.model} />
          </div>
        </SectionCard>

        <SectionCard
          title="Lịch và trung tâm đăng kiểm"
          icon={<CalendarDays size={22} />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Ngày đăng kiểm"
              value={dateOnly(result.slotDate)}
              icon={<CalendarDays size={14} />}
            />

            <InfoItem
              label="Khung giờ"
              value={
                result.startTime
                  ? `${timeOnly(result.startTime)} – ${timeOnly(
                      result.endTime
                    )}`
                  : null
              }
              icon={<Clock3 size={14} />}
            />

            <div className="sm:col-span-2">
              <InfoItem
                label="Trung tâm đăng kiểm"
                value={result.centerName}
                icon={<MapPin size={14} />}
              />
            </div>

            <div className="sm:col-span-2">
              <InfoItem
                label="Địa chỉ trung tâm"
                value={result.centerAddress}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Thông tin hỗ trợ" icon={<UserRound size={22} />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Người liên hệ" value={result.customerName} />

            <InfoItem
              label="Nhân viên phụ trách"
              value={result.staffName || "Chưa phân công"}
            />

            <div className="sm:col-span-2">
              <InfoItem
                label="Yêu cầu đến nhận xe"
                value={
                  result.pickupRequired
                    ? "Có yêu cầu nhận xe"
                    : "Không yêu cầu nhận xe"
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Dịch vụ và chi phí"
          icon={<CalendarCheck2 size={22} />}
        >
          <div className="space-y-5">
            <InfoItem label="Dịch vụ đăng ký" value={result.serviceName} />

            <div className="border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-500">
                Phí dịch vụ ghi nhận
              </p>

              <p className="mt-2 text-2xl font-extrabold text-blue-700">
                {money(result.totalAmount)}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-700" />

        <p className="text-xs leading-6 text-blue-900">
          Hoàn thành dịch vụ hỗ trợ không đồng nghĩa phương tiện đã đạt kiểm
          định. Kết quả kiểm định do đơn vị đăng kiểm có thẩm quyền quyết định.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw size={17} />
          Tra cứu lịch khác
        </button>

        <Link
          href="/booking"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
        >
          Đặt lịch mới
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function LookupPage() {
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<BookingLookupResult | null>(null);

  const [lookupError, setLookupError] = useState<string | null>(null);

  const methods = useForm<BookingLookupPayload>({
    defaultValues: {
      bookingCode: "",
      phone: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: BookingLookupPayload) => {
    setLoading(true);
    setLookupError(null);
    setResult(null);

    try {
      const data = await bookingLookupRepository.lookup({
        bookingCode: values.bookingCode.trim().toUpperCase(),

        phone: values.phone.trim(),
      });

      setResult(data);
    } catch (error) {
      setLookupError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Về trang chủ
        </Link>

        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <FileSearch size={15} />
            Tra cứu trực tuyến
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tra cứu lịch đăng kiểm
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Kiểm tra thông tin và trạng thái yêu cầu đăng kiểm. Không cần đăng
            nhập tài khoản.
          </p>
        </div>

        {!result ? (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Search size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Thông tin tra cứu
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Nhập thông tin đã sử dụng khi đặt lịch
                  </p>
                </div>
              </div>

              <HForm
                methods={methods}
                onSubmit={onSubmit}
                className="space-y-5"
              >
                <HTextField<BookingLookupPayload>
                  name="bookingCode"
                  label="Mã đặt lịch"
                  placeholder="Ví dụ: DK-916E73AF90C64E13"
                  required
                  rules={{
                    required: "Vui lòng nhập mã đặt lịch",

                    validate: (value) =>
                      /^DK-[A-F0-9]{16}$/i.test(String(value).trim()) ||
                      "Mã booking không đúng định dạng",
                  }}
                />

                <HTextField<BookingLookupPayload>
                  name="phone"
                  label="Số điện thoại đặt lịch"
                  type="tel"
                  placeholder="Nhập số điện thoại 10 chữ số"
                  required
                  rules={{
                    required: "Vui lòng nhập số điện thoại",

                    pattern: {
                      value: /^0\d{9}$/,
                      message: "Số điện thoại phải gồm 10 chữ số",
                    },
                  }}
                />

                {lookupError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-sm leading-6 text-red-700">
                      {lookupError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Đang tra cứu...
                    </>
                  ) : (
                    <>
                      <Search size={19} />
                      Tra cứu lịch đăng kiểm
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </HForm>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-2 text-xs leading-6 text-slate-500">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p>
                    Thông tin chỉ được trả về khi mã booking và số điện thoại
                    liên hệ cùng khớp với dữ liệu trên hệ thống.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <Phone size={19} className="mt-0.5 shrink-0 text-blue-700" />

              <p className="text-sm leading-6 text-blue-900">
                Bạn có thể tìm mã booking trên màn hình xác nhận sau khi gửi yêu
                cầu đặt lịch. Nếu quên mã, vui lòng liên hệ bộ phận hỗ trợ để
                được kiểm tra sau khi xác minh thông tin.
              </p>
            </div>
          </div>
        ) : (
          <BookingResult
            result={result}
            onReset={() => {
              setResult(null);
              setLookupError(null);
              methods.reset();
            }}
          />
        )}
      </div>
    </main>
  );
}
