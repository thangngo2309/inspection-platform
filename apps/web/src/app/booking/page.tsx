"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister,
} from "react-hook-form";
import { toast } from "sonner";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  AuthAccount,
  BookingCenter,
  BookingServiceOption,
  BookingSlot,
  CreateBookingPayload,
  CreatedBooking,
} from "@inspection/contracts";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";
import { getAuth } from "@/lib/auth";
import { bookingRepository } from "@/lib/repositories/booking.repository";

// ======================================================
// TYPES
// ======================================================

type BookingForm = CreateBookingPayload & {
  date: string;
};

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  name: Path<BookingForm>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  register: UseFormRegister<BookingForm>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: () => void;
};

// ======================================================
// CONSTANTS
// ======================================================

const DRAFT_KEY = "inspection_booking_draft_v1";

const vehicleTypes: SelectOption[] = [
  {
    value: "car",
    label: "Ô tô con",
  },
  {
    value: "truck",
    label: "Xe tải",
  },
  {
    value: "bus",
    label: "Xe khách",
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 " +
  "bg-white px-4 py-3 text-sm text-slate-900 " +
  "outline-none transition-all " +
  "focus:border-blue-600 focus:ring-4 focus:ring-blue-100 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const defaultValues: BookingForm = {
  centerId: "",
  slotId: "",
  serviceId: "",
  date: "",

  customerName: "",
  customerPhone: "",
  customerEmail: "",

  licensePlate: "",
  vehicleType: "car",

  brand: "",
  model: "",
  chassisNumber: "",
  engineNumber: "",

  payloadKg: "",
  inspectionExpiryDate: "",
  insuranceExpiryDate: "",

  pickupRequired: true,
  pickupAddress: "",
  returnAddress: "",
  customerNote: "",
};

// ======================================================
// HELPERS
// ======================================================

function formatMoney(value: string | number) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0 đ";
  }

  return `${number.toLocaleString("vi-VN")} đ`;
}

function localDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function cleanOptionalInteger(value?: number) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isInteger(number) ? number : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể thực hiện yêu cầu. Vui lòng thử lại.";
}

// ======================================================
// SHARED UI
// ======================================================

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
      </div>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}

function FormSection({
  children,
  icon,
  title,
  description,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <SectionTitle icon={icon} title={title} description={description} />

      {children}
    </section>
  );
}

/**
 * Dropdown dùng chung trong trang Booking.
 *
 * appearance-none loại bỏ arrow mặc định.
 * ChevronDown nằm ngoài vùng tương tác của select.
 * pointer-events-none tránh chặn click.
 */
function SelectField({
  name,
  label,
  placeholder = "Vui lòng lựa chọn",
  options,
  register,
  error,
  required = false,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  const registration = register(name, {
    required: required ? `Vui lòng chọn ${label.toLowerCase()}` : false,
  });

  return (
    <div className="min-w-0">
      <label htmlFor={name} className={labelClass}>
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={registration.name}
          ref={registration.ref}
          onBlur={registration.onBlur}
          onChange={(event) => {
            void registration.onChange(event);
            onChange?.();
          }}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={[
            inputClass,
            "min-h-12 cursor-pointer appearance-none",
            "pr-12",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "",
          ].join(" ")}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500">
          <ChevronDown size={20} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function BookingPage() {
  const router = useRouter();

  const [account, setAccount] = useState<AuthAccount | null>(null);

  const [authReady, setAuthReady] = useState(false);

  const [centers, setCenters] = useState<BookingCenter[]>([]);

  const [services, setServices] = useState<BookingServiceOption[]>([]);

  const [slots, setSlots] = useState<BookingSlot[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [created, setCreated] = useState<CreatedBooking | null>(null);

  const [slotRefreshKey, setSlotRefreshKey] = useState(0);

  const today = useMemo(() => localDate(), []);

  const methods = useForm<BookingForm>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const centerId = watch("centerId");
  const date = watch("date");
  const vehicleType = watch("vehicleType");
  const serviceId = watch("serviceId");
  const pickupRequired = watch("pickupRequired");
  const selectedSlotId = watch("slotId");

  const selectedService = useMemo(
    () => services.find((item) => String(item.id) === String(serviceId)),
    [services, serviceId]
  );

  const selectedCenter = useMemo(
    () => centers.find((item) => String(item.id) === String(centerId)),
    [centers, centerId]
  );

  const selectedSlot = useMemo(
    () => slots.find((item) => String(item.id) === String(selectedSlotId)),
    [slots, selectedSlotId]
  );

  // ====================================================
  // LOAD AUTH & RESTORE DRAFT
  // ====================================================

  useEffect(() => {
    const auth = getAuth();

    setAccount(auth?.user ?? null);
    setAuthReady(true);

    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);

      if (saved) {
        const draft = JSON.parse(saved) as BookingForm;

        methods.reset({
          ...defaultValues,
          ...draft,
          slotId: "",
        });

        sessionStorage.removeItem(DRAFT_KEY);

        toast.info(
          "Đã khôi phục thông tin đặt lịch. Vui lòng chọn lại khung giờ."
        );
      } else if (auth?.user) {
        methods.setValue("customerName", auth.user.fullName ?? "");

        methods.setValue("customerPhone", auth.user.phone ?? "");

        methods.setValue("customerEmail", auth.user.email ?? "");
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, [methods]);

  // ====================================================
  // LOAD CENTERS & SERVICES
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const [centerData, serviceData] = await Promise.all([
          bookingRepository.centers(),
          bookingRepository.services(),
        ]);

        if (!mounted) return;

        setCenters(centerData);
        setServices(serviceData);
      } catch (error) {
        if (mounted) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // LOAD AVAILABLE SLOTS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    setValue("slotId", "", {
      shouldValidate: false,
    });

    setSlots([]);

    if (!centerId || !date || !vehicleType) {
      setLoadingSlots(false);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);

      try {
        const result = await bookingRepository.slots({
          centerId,
          date,
          vehicleType,
        });

        if (mounted) {
          setSlots(result);
        }
      } catch (error) {
        if (mounted) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoadingSlots(false);
        }
      }
    };

    void loadSlots();

    return () => {
      mounted = false;
    };
  }, [centerId, date, vehicleType, slotRefreshKey, setValue]);

  // ====================================================
  // AUTH REDIRECT
  // ====================================================

  const saveDraftAndLogin = useCallback(() => {
    const values = getValues();

    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      toast.warning("Trình duyệt không thể lưu tạm thông tin đã nhập.");
    }

    router.push("/login");
  }, [getValues, router]);

  // ====================================================
  // INVALID FORM
  // ====================================================

  const onInvalid = (formErrors: FieldErrors<BookingForm>) => {
    const fieldNames = Object.keys(formErrors);

    if (fieldNames.length === 0) {
      return;
    }

    const first = fieldNames[0] as Path<BookingForm>;

    const message =
      formErrors[first]?.message?.toString() ||
      "Vui lòng kiểm tra thông tin bắt buộc.";

    toast.error(message);

    methods.setFocus(first);

    const element = document.querySelector(`[name="${first}"]`);

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // ====================================================
  // CREATE BOOKING
  // ====================================================

  const onSubmit = async (values: BookingForm) => {
    if (!values.serviceId) {
      toast.error("Vui lòng chọn dịch vụ");
      return;
    }

    if (!values.centerId) {
      toast.error("Vui lòng chọn trung tâm đăng kiểm");
      return;
    }

    if (!values.date) {
      toast.error("Vui lòng chọn ngày đăng kiểm");
      return;
    }

    if (values.date < localDate()) {
      toast.error("Ngày đăng kiểm không được nằm trong quá khứ.");
      return;
    }

    if (!values.slotId) {
      toast.error("Vui lòng chọn khung giờ còn trống");

      document.getElementById("booking-slots")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (values.pickupRequired && !values.pickupAddress?.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận xe");
      return;
    }

    setSubmitting(true);

    try {
      const payload: CreateBookingPayload = {
        centerId: values.centerId,
        slotId: values.slotId,
        serviceId: values.serviceId,

        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),

        customerEmail: cleanOptional(values.customerEmail),

        licensePlate: values.licensePlate.trim().toUpperCase(),

        vehicleType: values.vehicleType,

        brand: cleanOptional(values.brand),
        model: cleanOptional(values.model),

        manufactureYear: cleanOptionalInteger(values.manufactureYear),

        chassisNumber: cleanOptional(values.chassisNumber),

        engineNumber: cleanOptional(values.engineNumber),

        seats: cleanOptionalInteger(values.seats),

        payloadKg: cleanOptional(values.payloadKg),

        inspectionExpiryDate: cleanOptional(values.inspectionExpiryDate),

        insuranceExpiryDate: cleanOptional(values.insuranceExpiryDate),

        pickupRequired: values.pickupRequired,

        pickupAddress: values.pickupRequired
          ? cleanOptional(values.pickupAddress)
          : undefined,

        returnAddress: cleanOptional(values.returnAddress),

        customerNote: cleanOptional(values.customerNote),
      };

      const result = await bookingRepository.create(payload);

      setCreated(result);

      toast.success("Đã gửi yêu cầu đặt lịch thành công.");
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // BOOKING SUCCESS
  // ====================================================

  if (created) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={44} className="text-emerald-600" />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
            Đặt lịch thành công
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Hệ thống đã tiếp nhận yêu cầu của bạn. Booking hiện đang chờ xác
            nhận và phân công nhân viên phụ trách.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Mã đặt lịch</p>

            <p className="mt-2 break-all text-2xl font-extrabold text-blue-700">
              {created.bookingCode}
            </p>

            <div className="my-5 border-t border-slate-200" />

            <p className="text-sm text-slate-500">Phí dịch vụ dự kiến</p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatMoney(created.totalAmount)}
            </p>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-left text-sm leading-6 text-blue-800">
            <Info size={19} className="mt-0.5 shrink-0" />

            <p>
              Việc gửi yêu cầu không đồng nghĩa với việc trung tâm đã xác nhận
              lịch hoặc bảo đảm kết quả kiểm định.
            </p>
          </div>

          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Về trang chủ
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  // ====================================================
  // MAIN PAGE
  // ====================================================

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Trang chủ
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Đặt lịch đăng kiểm xe
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
          Nhập thông tin xe, thông tin liên hệ và lựa chọn khung giờ còn trống
          để gửi yêu cầu.
        </p>
      </div>

      {loadingOptions ? (
        <div className="flex min-h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-blue-700">
            <Loader2 size={32} className="animate-spin" />

            <p className="text-sm text-slate-500">
              Đang tải thông tin đặt lịch...
            </p>
          </div>
        </div>
      ) : (
        <HForm
          methods={methods}
          onSubmit={onSubmit}
          onInvalid={onInvalid}
          className="space-y-6"
        >
          {/* ==================================== */}
          {/* VEHICLE INFORMATION */}
          {/* ==================================== */}

          <FormSection
            icon={<CarFront size={23} />}
            title="Thông tin phương tiện"
            description="Cung cấp thông tin chính xác theo giấy đăng ký xe."
          >
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <HTextField<BookingForm>
                name="licensePlate"
                label="Biển số xe"
                placeholder="Ví dụ: 43A-123.45"
                required
                rules={{
                  required: "Vui lòng nhập biển số xe",
                  validate: (value) =>
                    !!String(value ?? "").trim() || "Biển số xe không hợp lệ",
                }}
              />

              <SelectField
                name="vehicleType"
                label="Loại xe"
                placeholder="Chọn loại xe"
                options={vehicleTypes}
                register={register}
                error={errors.vehicleType?.message}
                required
              />

              <HTextField<BookingForm>
                name="brand"
                label="Hãng xe"
                placeholder="Ví dụ: Toyota"
              />

              <HTextField<BookingForm>
                name="model"
                label="Dòng xe"
                placeholder="Ví dụ: Innova"
              />

              <HTextField<BookingForm>
                name="manufactureYear"
                label="Năm sản xuất"
                type="number"
                placeholder="Ví dụ: 2022"
                rules={{
                  validate: (value) => {
                    if (value === undefined || String(value).trim() === "") {
                      return true;
                    }

                    const year = Number(value);

                    return (
                      (Number.isInteger(year) &&
                        year >= 1900 &&
                        year <= new Date().getFullYear() + 1) ||
                      "Năm sản xuất không hợp lệ"
                    );
                  },
                }}
              />

              <HTextField<BookingForm>
                name="seats"
                label="Số chỗ ngồi"
                type="number"
                placeholder="Ví dụ: 7"
                rules={{
                  validate: (value) => {
                    if (value === undefined || String(value).trim() === "") {
                      return true;
                    }

                    return (
                      (Number.isInteger(Number(value)) && Number(value) >= 1) ||
                      "Số chỗ ngồi phải lớn hơn 0"
                    );
                  },
                }}
              />

              <HTextField<BookingForm>
                name="chassisNumber"
                label="Số khung"
                placeholder="Nhập số khung"
              />

              <HTextField<BookingForm>
                name="engineNumber"
                label="Số máy"
                placeholder="Nhập số máy"
              />

              <HTextField<BookingForm>
                name="payloadKg"
                label="Tải trọng (kg)"
                placeholder="Ví dụ: 200"
                rules={{
                  validate: (value) => {
                    if (!String(value ?? "").trim()) {
                      return true;
                    }

                    const number = Number(value);

                    return (
                      (Number.isFinite(number) && number >= 0) ||
                      "Tải trọng không hợp lệ"
                    );
                  },
                }}
              />

              <HTextField<BookingForm>
                name="inspectionExpiryDate"
                label="Ngày hết hạn đăng kiểm"
                type="date"
              />

              <HTextField<BookingForm>
                name="insuranceExpiryDate"
                label="Ngày hết hạn bảo hiểm"
                type="date"
              />
            </div>
          </FormSection>

          {/* ==================================== */}
          {/* CUSTOMER INFORMATION */}
          {/* ==================================== */}

          <FormSection
            icon={<UserRound size={23} />}
            title="Thông tin liên hệ"
            description="Thông tin người đại diện nhận thông báo và phối hợp bàn giao xe."
          >
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <HTextField<BookingForm>
                name="customerName"
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                required
                rules={{
                  required: "Vui lòng nhập họ và tên",
                }}
              />

              <HTextField<BookingForm>
                name="customerPhone"
                label="Số điện thoại"
                type="tel"
                placeholder="Nhập số điện thoại"
                required
                rules={{
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^0\d{9}$/,
                    message: "Số điện thoại phải gồm 10 chữ số",
                  },
                }}
              />

              <HTextField<BookingForm>
                name="customerEmail"
                label="Email (không bắt buộc)"
                type="email"
                placeholder="example@gmail.com"
                rules={{
                  validate: (value) =>
                    !value ||
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ||
                    "Email không hợp lệ",
                }}
              />
            </div>
          </FormSection>

          {/* ==================================== */}
          {/* SERVICE & SCHEDULE */}
          {/* ==================================== */}

          <FormSection
            icon={<CalendarDays size={23} />}
            title="Dịch vụ và lịch đăng kiểm"
            description="Chọn dịch vụ, trung tâm đăng kiểm và thời gian phù hợp."
          >
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <SelectField
                name="serviceId"
                label="Dịch vụ"
                placeholder="Chọn dịch vụ"
                options={services.map((service) => ({
                  value: String(service.id),
                  label: `${service.name} – ${formatMoney(service.basePrice)}`,
                }))}
                register={register}
                error={errors.serviceId?.message}
                required
              />

              <SelectField
                name="centerId"
                label="Trung tâm đăng kiểm"
                placeholder="Chọn trung tâm"
                options={centers.map((center) => ({
                  value: String(center.id),
                  label: center.name,
                }))}
                register={register}
                error={errors.centerId?.message}
                required
              />

              <HTextField<BookingForm>
                name="date"
                label="Ngày đăng kiểm"
                type="date"
                required
                slotProps={{
                  htmlInput: {
                    min: today,
                  },
                }}
                rules={{
                  required: "Vui lòng chọn ngày đăng kiểm",
                  validate: (value) =>
                    String(value) >= localDate() ||
                    "Không được chọn ngày trong quá khứ",
                }}
              />
            </div>

            {selectedCenter && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" />
                <span>{selectedCenter.address}</span>
              </div>
            )}

            {/* AVAILABLE SLOTS */}
            <div id="booking-slots" className="mt-7 scroll-mt-28">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Khung giờ còn trống
                  <span className="ml-1 text-red-500">*</span>
                </label>

                {centerId && date && (
                  <button
                    type="button"
                    disabled={loadingSlots}
                    onClick={() => setSlotRefreshKey((value) => value + 1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={loadingSlots ? "animate-spin" : ""}
                    />
                    Làm mới
                  </button>
                )}
              </div>

              {!centerId || !date ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Vui lòng chọn trung tâm và ngày đăng kiểm để xem khung giờ.
                </div>
              ) : loadingSlots ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                  Đang kiểm tra lịch trống...
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={20}
                      className="shrink-0 text-amber-600"
                    />

                    <p className="text-sm leading-6 text-amber-900">
                      Chưa có khung giờ khả dụng hoặc nhân viên phụ trách đã
                      hết. Vui lòng chọn ngày hoặc trung tâm khác.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {slots.map((slot) => {
                    const selected = String(selectedSlotId) === String(slot.id);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setValue("slotId", String(slot.id), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={[
                          "relative rounded-xl border p-4 text-left transition-all",
                          "focus:outline-none focus:ring-4 focus:ring-blue-100",
                          selected
                            ? "border-blue-600 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {selected && (
                          <CheckCircle2
                            size={17}
                            className="absolute right-3 top-3 text-blue-700"
                          />
                        )}

                        <div className="flex items-center gap-2">
                          <Clock3
                            size={17}
                            className={
                              selected ? "text-blue-700" : "text-slate-400"
                            }
                          />

                          <span
                            className={`font-bold ${
                              selected ? "text-blue-800" : "text-slate-900"
                            }`}
                          >
                            {slot.startTime.slice(0, 5)}
                          </span>
                        </div>

                        <div
                          className={`mt-2 text-xs font-medium ${
                            selected ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          Còn {slot.remaining} suất
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedSlot && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 size={17} />
                  Đã chọn khung giờ {selectedSlot.startTime.slice(0, 5)}
                  {" – "}
                  {selectedSlot.endTime.slice(0, 5)}
                </div>
              )}
            </div>
          </FormSection>

          {/* ==================================== */}
          {/* PICKUP & RETURN */}
          {/* ==================================== */}

          <FormSection
            icon={<MapPin size={23} />}
            title="Nhận và bàn giao phương tiện"
            description="Cung cấp địa chỉ để nhân viên phối hợp thực hiện dịch vụ."
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...register("pickupRequired")}
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Yêu cầu nhân viên đến nhận xe
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Nhân viên sẽ liên hệ để thống nhất thời gian và địa điểm bàn
                    giao.
                  </p>
                </div>
              </label>

              {pickupRequired && (
                <HTextField<BookingForm>
                  name="pickupAddress"
                  label="Địa chỉ nhận xe"
                  placeholder="Số nhà, tên đường, phường..."
                  required
                  rules={{
                    validate: (value) =>
                      !getValues("pickupRequired") ||
                      !!String(value ?? "").trim() ||
                      "Vui lòng nhập địa chỉ nhận xe",
                  }}
                />
              )}

              <HTextField<BookingForm>
                name="returnAddress"
                label="Địa chỉ bàn giao xe"
                placeholder="Để trống nếu bàn giao tại địa chỉ nhận xe"
              />

              <HTextField<BookingForm>
                name="customerNote"
                label="Ghi chú cho nhân viên"
                placeholder="Thông tin bổ sung nếu có"
                multiline
                rows={3}
              />
            </div>
          </FormSection>

          {/* ==================================== */}
          {/* SUMMARY */}
          {/* ==================================== */}

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Phí dịch vụ dự kiến
                </p>

                <p className="mt-2 text-3xl font-extrabold text-blue-700">
                  {selectedService
                    ? formatMoney(selectedService.basePrice)
                    : "—"}
                </p>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Các khoản phí kiểm định, bảo hiểm và chi phí phát sinh nếu có
                  sẽ được thông báo theo dịch vụ thực tế.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || loadingSlots || loadingOptions}
                className={[
                  "inline-flex min-h-12 w-full items-center justify-center gap-2",
                  "rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white",
                  "transition hover:bg-blue-800",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              >
                {submitting ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Đang tạo booking...
                  </>
                ) : (
                  <>
                    Xác nhận đặt lịch
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p>
                Lịch đặt cần được hệ thống và đơn vị liên quan xác nhận. Dịch vụ
                không bảo đảm kết quả kiểm định hoặc quyền ưu tiên trái quy
                định.
              </p>
            </div>
          </section>
        </HForm>
      )}
    </main>
  );
}
