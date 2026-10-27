"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
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
  Copy,
  Info,
  Loader2,
  MapPin,
  Plus,
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
import { AUTH_CHANGED_EVENT, getAuth } from "@/lib/auth";
import { bookingRepository } from "@/lib/repositories/booking.repository";
import {
  myVehiclesRepository,
  type SavedVehicle,
} from "@/lib/repositories/my-vehicles.repository";

// ======================================================
// TYPES
// ======================================================

type BookingForm = CreateBookingPayload & {
  date: string;
};

type BookingSubmitPayload = CreateBookingPayload & {
  vehicleId?: string;
  saveVehicle?: boolean;
};

type VehicleMode = "saved" | "manual";

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
};

// ======================================================
// CONSTANTS
// ======================================================

const vehicleTypes: SelectOption[] = [
  { value: "car", label: "Ô tô con" },
  { value: "truck", label: "Xe tải" },
  { value: "bus", label: "Xe khách" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white " +
  "px-4 py-3 text-sm text-slate-900 outline-none " +
  "transition focus:border-blue-600 focus:ring-4 " +
  "focus:ring-blue-100 disabled:cursor-not-allowed " +
  "disabled:bg-slate-100";

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
  manufactureYear: undefined,
  seats: undefined,
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
  const amount = Number(value);

  return Number.isFinite(amount) ? `${amount.toLocaleString("vi-VN")} đ` : "—";
}

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanOptional(value?: string | null) {
  return value?.trim() || undefined;
}

function cleanOptionalInteger(value?: number) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isInteger(number) ? number : undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Không thể thực hiện yêu cầu. Vui lòng thử lại.";
}

// ======================================================
// SHARED UI
// ======================================================

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            {icon}
          </div>

          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}

function SelectField({
  name,
  label,
  placeholder = "Vui lòng lựa chọn",
  options,
  register,
  error,
  required = false,
  disabled = false,
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
          onChange={registration.onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={[
            inputClass,
            "min-h-12 cursor-pointer appearance-none pr-12",
            error ? "border-red-400" : "",
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
          <ChevronDown size={20} />
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function VehicleChoiceCard({
  active,
  title,
  description,
  onClick,
  disabled = false,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "flex items-start gap-3 rounded-xl border p-4 text-left transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-blue-600 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-blue-300",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600",
        ].join(" ")}
      >
        <CarFront size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">{title}</span>

          {active && (
            <CheckCircle2 size={18} className="shrink-0 text-blue-700" />
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </button>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function BookingPage() {
  const [account, setAccount] = useState<AuthAccount | null>(null);

  const [authReady, setAuthReady] = useState(false);

  const [vehicleMode, setVehicleMode] = useState<VehicleMode>("manual");

  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);

  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  const [vehicleReloadKey, setVehicleReloadKey] = useState(0);

  const [saveNewVehicle, setSaveNewVehicle] = useState(true);

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
    shouldUnregister: false,
  });

  const {
    register,
    watch,
    setValue,
    getValues,
    reset,
    setFocus,
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

  const selectedSavedVehicle = useMemo(
    () =>
      savedVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [savedVehicles, selectedVehicleId]
  );

  const isAuthenticated = authReady && Boolean(account);
  const isSavedMode = isAuthenticated && vehicleMode === "saved";

  // ====================================================
  // AUTH
  // ====================================================

  useEffect(() => {
    const syncAuth = () => {
      const auth = getAuth();
      setAccount(auth?.user ?? null);
      setAuthReady(true);
    };

    syncAuth();

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  // Prefill thông tin liên hệ từ tài khoản.
  useEffect(() => {
    if (!account) return;

    const current = getValues();

    if (!current.customerName) {
      setValue("customerName", account.fullName ?? "");
    }

    if (!current.customerPhone) {
      setValue("customerPhone", account.phone ?? "");
    }

    if (!current.customerEmail) {
      setValue("customerEmail", account.email ?? "");
    }
  }, [account, getValues, setValue]);

  // ====================================================
  // SAVED VEHICLES
  // ====================================================

  useEffect(() => {
    if (!authReady || !account) {
      setSavedVehicles([]);
      setSelectedVehicleId("");
      setVehicleMode("manual");
      setLoadingVehicles(false);
      setVehiclesError(null);
      return;
    }

    let active = true;

    const loadVehicles = async () => {
      setLoadingVehicles(true);
      setVehiclesError(null);

      try {
        const vehicles = await myVehiclesRepository.list();

        if (!active) return;

        setSavedVehicles(vehicles);

        setSelectedVehicleId((previous) => {
          if (previous && vehicles.some((item) => item.id === previous)) {
            return previous;
          }

          return vehicles[0]?.id ?? "";
        });

        // Nếu đã có xe thì ưu tiên chế độ chọn xe.
        // Khi người dùng đang nhập tay, không ép
        // chuyển chế độ trong lần tải lại.
        setVehicleMode((previous) => {
          if (!vehicles.length) return "manual";

          return previous === "saved" ? "saved" : "manual";
        });
      } catch (error) {
        if (!active) return;

        setSavedVehicles([]);
        setSelectedVehicleId("");
        setVehicleMode("manual");
        setVehiclesError(getErrorMessage(error));
      } finally {
        if (active) {
          setLoadingVehicles(false);
        }
      }
    };

    void loadVehicles();

    return () => {
      active = false;
    };
  }, [account, authReady, vehicleReloadKey]);

  // ====================================================
  // SYNC SELECTED VEHICLE
  // ====================================================

  useEffect(() => {
    if (!isSavedMode || !selectedSavedVehicle) {
      return;
    }

    const vehicle = selectedSavedVehicle;

    setValue("licensePlate", vehicle.licensePlate);
    setValue("vehicleType", vehicle.vehicleType);
    setValue("brand", vehicle.brand ?? "");
    setValue("model", vehicle.model ?? "");

    setValue("manufactureYear", vehicle.manufactureYear ?? undefined);

    setValue("seats", vehicle.seats ?? undefined);

    setValue("chassisNumber", vehicle.chassisNumber ?? "");

    setValue("engineNumber", vehicle.engineNumber ?? "");

    setValue("payloadKg", vehicle.payloadKg ?? "");

    setValue(
      "inspectionExpiryDate",
      vehicle.inspectionExpiryDate?.slice(0, 10) ?? ""
    );

    setValue(
      "insuranceExpiryDate",
      vehicle.insuranceExpiryDate?.slice(0, 10) ?? ""
    );
  }, [isSavedMode, selectedSavedVehicle, setValue]);

  // ====================================================
  // LOAD BOOKING OPTIONS
  // ====================================================

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingOptions(true);

      try {
        const [centerData, serviceData] = await Promise.all([
          bookingRepository.centers(),
          bookingRepository.services(),
        ]);

        if (!active) return;

        setCenters(centerData);
        setServices(serviceData);
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  // ====================================================
  // LOAD AVAILABLE SLOTS
  // ====================================================

  useEffect(() => {
    let active = true;

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
        const response = await bookingRepository.slots({
          centerId,
          date,
          vehicleType,
        });

        if (active) {
          setSlots(response);
        }
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    };

    void loadSlots();

    return () => {
      active = false;
    };
  }, [centerId, date, vehicleType, slotRefreshKey, setValue]);

  // ====================================================
  // SWITCH VEHICLE MODE
  // ====================================================

  const clearVehicleFields = () => {
    setValue("licensePlate", "", {
      shouldDirty: true,
    });
    setValue("vehicleType", "car", {
      shouldDirty: true,
    });
    setValue("brand", "");
    setValue("model", "");
    setValue("manufactureYear", undefined);
    setValue("seats", undefined);
    setValue("chassisNumber", "");
    setValue("engineNumber", "");
    setValue("payloadKg", "");
    setValue("inspectionExpiryDate", "");
    setValue("insuranceExpiryDate", "");
  };

  const switchToManual = () => {
    if (vehicleMode === "manual") return;

    setVehicleMode("manual");
    setSelectedVehicleId("");
    clearVehicleFields();
  };

  const switchToSaved = () => {
    if (!savedVehicles.length) {
      toast.info(
        "Bạn chưa có xe đã lưu. Hãy thêm xe hoặc nhập thông tin xe mới."
      );
      return;
    }

    setSelectedVehicleId(savedVehicles[0]?.id ?? "");
    setVehicleMode("saved");
  };

  // ====================================================
  // FORM ERROR
  // ====================================================

  const onInvalid = (formErrors: FieldErrors<BookingForm>) => {
    const fieldNames = Object.keys(formErrors);

    if (!fieldNames.length) return;

    const first = fieldNames[0] as Path<BookingForm>;

    const message =
      formErrors[first]?.message?.toString() ||
      "Vui lòng kiểm tra các thông tin bắt buộc.";

    toast.error(message);

    setFocus(first);

    const element = document.querySelector(`[name="${first}"]`);

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // ====================================================
  // SUBMIT BOOKING
  // ====================================================

  const onSubmit = async (values: BookingForm) => {
    if (submitting) return;

    if (loadingVehicles && isAuthenticated) {
      toast.info("Đang tải thông tin phương tiện.");
      return;
    }

    if (isSavedMode && !selectedSavedVehicle) {
      toast.error("Vui lòng chọn xe đã lưu.");
      return;
    }

    if (!values.serviceId) {
      toast.error("Vui lòng chọn dịch vụ.");
      return;
    }

    if (!values.centerId) {
      toast.error("Vui lòng chọn trung tâm đăng kiểm.");
      return;
    }

    if (!values.date || values.date < localDate()) {
      toast.error("Ngày đăng kiểm không hợp lệ.");
      return;
    }

    if (!values.slotId) {
      toast.error("Vui lòng chọn khung giờ còn trống.");

      document.getElementById("booking-slots")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (values.pickupRequired && !values.pickupAddress?.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận xe.");
      return;
    }

    // Lấy dữ liệu xe đã lưu để khớp ngay cả khi
    // React Hook Form chưa kịp đồng bộ state.
    const vehicle = isSavedMode ? selectedSavedVehicle : null;

    const licensePlate = vehicle ? vehicle.licensePlate : values.licensePlate;

    const resolvedVehicleType = vehicle
      ? vehicle.vehicleType
      : values.vehicleType;

    if (!licensePlate?.trim()) {
      toast.error("Vui lòng nhập biển số xe.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: BookingSubmitPayload = {
        centerId: values.centerId,
        slotId: values.slotId,
        serviceId: values.serviceId,

        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        customerEmail: cleanOptional(values.customerEmail),

        vehicleId: vehicle?.id,
        saveVehicle: isAuthenticated && !vehicle && saveNewVehicle,

        licensePlate: licensePlate.trim().toUpperCase(),

        vehicleType: resolvedVehicleType,

        brand: cleanOptional(vehicle?.brand ?? values.brand),

        model: cleanOptional(vehicle?.model ?? values.model),

        manufactureYear: cleanOptionalInteger(
          vehicle?.manufactureYear ?? values.manufactureYear
        ),

        seats: cleanOptionalInteger(vehicle?.seats ?? values.seats),

        chassisNumber: cleanOptional(
          vehicle?.chassisNumber ?? values.chassisNumber
        ),

        engineNumber: cleanOptional(
          vehicle?.engineNumber ?? values.engineNumber
        ),

        payloadKg: cleanOptional(vehicle?.payloadKg ?? values.payloadKg),

        inspectionExpiryDate: cleanOptional(
          vehicle?.inspectionExpiryDate ?? values.inspectionExpiryDate
        ),

        insuranceExpiryDate: cleanOptional(
          vehicle?.insuranceExpiryDate ?? values.insuranceExpiryDate
        ),

        pickupRequired: values.pickupRequired,

        pickupAddress: values.pickupRequired
          ? cleanOptional(values.pickupAddress)
          : undefined,

        returnAddress: cleanOptional(values.returnAddress),

        customerNote: cleanOptional(values.customerNote),
      };

      // bookingRepository.create() phải tự dùng:
      // - /account/bookings nếu đã đăng nhập
      // - /bookings nếu chưa đăng nhập
      const result = await bookingRepository.create(payload);

      setCreated(result);
      toast.success("Đã gửi yêu cầu đặt lịch thành công.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // SUCCESS
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
            Hệ thống đã tiếp nhận yêu cầu đặt lịch. Booking đang chờ xác nhận và
            điều phối nhân viên.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Mã đặt lịch</p>

            <p className="mt-2 break-all text-2xl font-extrabold text-blue-700">
              {created.bookingCode}
            </p>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(created.bookingCode);

                  toast.success("Đã sao chép mã đặt lịch.");
                } catch {
                  toast.error("Không thể sao chép mã.");
                }
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Copy size={15} />
              Sao chép mã
            </button>

            <div className="my-5 border-t border-slate-200" />

            <p className="text-sm text-slate-500">Phí dịch vụ dự kiến</p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatMoney(created.totalAmount)}
            </p>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-left text-sm leading-6 text-blue-800">
            <Info size={19} className="mt-0.5 shrink-0" />

            <p>
              Việc gửi yêu cầu không đồng nghĩa với trung tâm đã xác nhận lịch
              hoặc bảo đảm kết quả kiểm định.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Link
                href="/account/bookings"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Booking của tôi
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href="/lookup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Tra cứu booking
                <ArrowRight size={18} />
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // MAIN FORM
  // ====================================================

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Trang chủ
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Đặt lịch đăng kiểm xe
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
          {isAuthenticated
            ? "Chọn phương tiện đã lưu hoặc nhập thông tin xe mới, sau đó lựa chọn lịch đăng kiểm phù hợp."
            : "Nhập thông tin xe, thông tin liên hệ và lựa chọn khung giờ còn trống để gửi yêu cầu. Không cần đăng nhập."}
        </p>
      </div>

      {loadingOptions ? (
        <div className="flex min-h-80 items-center justify-center gap-3 text-slate-500">
          <Loader2 size={28} className="animate-spin text-blue-700" />
          Đang tải thông tin đặt lịch...
        </div>
      ) : (
        <HForm
          methods={methods}
          onSubmit={onSubmit}
          onInvalid={onInvalid}
          className="space-y-6"
        >
          {/* ==================================== */}
          {/* VEHICLE */}
          {/* ==================================== */}

          <FormSection
            icon={<CarFront size={23} />}
            title="Thông tin phương tiện"
            description={
              isAuthenticated
                ? "Chọn xe trong tài khoản hoặc nhập thông tin một xe khác."
                : "Cung cấp thông tin chính xác theo giấy đăng ký xe."
            }
          >
            {isAuthenticated && (
              <div className="mb-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <VehicleChoiceCard
                    active={vehicleMode === "saved"}
                    title="Chọn xe của tôi"
                    description={
                      loadingVehicles
                        ? "Đang tải danh sách xe..."
                        : `${savedVehicles.length} xe đã lưu trong tài khoản`
                    }
                    disabled={loadingVehicles || savedVehicles.length === 0}
                    onClick={switchToSaved}
                  />

                  <VehicleChoiceCard
                    active={vehicleMode === "manual"}
                    title="Nhập thông tin xe mới"
                    description="Nhập một phương tiện chưa có trong danh sách đã lưu."
                    onClick={switchToManual}
                  />
                </div>

                {vehiclesError && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Không tải được danh sách xe: {vehiclesError}
                    </p>

                    <button
                      type="button"
                      onClick={() => setVehicleReloadKey((value) => value + 1)}
                      className="inline-flex items-center gap-1 text-sm font-bold text-amber-800"
                    >
                      <RefreshCw size={15} />
                      Thử lại
                    </button>
                  </div>
                )}

                {!loadingVehicles && savedVehicles.length === 0 && (
                  <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center">
                    <p className="text-sm leading-6 text-blue-900">
                      Bạn chưa lưu xe nào. Có thể nhập xe ngay bên dưới hoặc tạo
                      hồ sơ xe trước.
                    </p>

                    <Link
                      href="/account/vehicles"
                      className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      <Plus size={17} />
                      Quản lý xe
                    </Link>
                  </div>
                )}

                {vehicleMode === "saved" && selectedSavedVehicle && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                    <label htmlFor="saved-vehicle" className={labelClass}>
                      Chọn phương tiện
                    </label>

                    <div className="relative">
                      <select
                        id="saved-vehicle"
                        value={selectedVehicleId}
                        onChange={(event) =>
                          setSelectedVehicleId(event.target.value)
                        }
                        className={`${inputClass} appearance-none pr-12`}
                      >
                        {savedVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.licensePlate}
                            {" – "}
                            {[vehicle.brand, vehicle.model]
                              .filter(Boolean)
                              .join(" ") || vehicle.vehicleType}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={20}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl border border-blue-100 bg-white p-4 sm:grid-cols-2">
                      {[
                        {
                          label: "Biển số",
                          value: selectedSavedVehicle.licensePlate,
                        },
                        {
                          label: "Loại xe",
                          value:
                            vehicleTypes.find(
                              (item) =>
                                item.value === selectedSavedVehicle.vehicleType
                            )?.label ?? selectedSavedVehicle.vehicleType,
                        },
                        {
                          label: "Hãng xe",
                          value: selectedSavedVehicle.brand ?? "—",
                        },
                        {
                          label: "Dòng xe",
                          value: selectedSavedVehicle.model ?? "—",
                        },
                        {
                          label: "Năm sản xuất",
                          value: selectedSavedVehicle.manufactureYear ?? "—",
                        },
                        {
                          label: "Số chỗ",
                          value: selectedSavedVehicle.seats ?? "—",
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs leading-6 text-blue-800">
                      Thông tin xe được lấy từ hồ sơ đã lưu. Nếu cần thay đổi,
                      hãy chỉnh sửa trong mục Xe của tôi trước khi đặt lịch.
                    </p>
                  </div>
                )}

                {vehicleMode === "manual" && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={saveNewVehicle}
                      onChange={(event) =>
                        setSaveNewVehicle(event.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-900">
                        Lưu phương tiện vào tài khoản
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Lần sau có thể chọn xe này mà không cần nhập lại thông
                        tin.
                      </span>
                    </span>
                  </label>
                )}
              </div>
            )}

            {(!isAuthenticated || vehicleMode === "manual") && (
              <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                <HTextField<BookingForm>
                  name="licensePlate"
                  label="Biển số xe"
                  placeholder="Ví dụ: 43A-123.45"
                  required
                  rules={{
                    required: "Vui lòng nhập biển số xe",
                    validate: (value) =>
                      Boolean(String(value ?? "").trim()) ||
                      "Biển số xe không hợp lệ",
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
                        (Number.isInteger(Number(value)) &&
                          Number(value) >= 1) ||
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
            )}
          </FormSection>

          {/* ==================================== */}
          {/* CONTACT */}
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
          {/* SERVICE AND SCHEDULE */}
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
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <AlertCircle size={20} className="shrink-0 text-amber-600" />

                  <p className="text-sm leading-6 text-amber-900">
                    Chưa có khung giờ khả dụng hoặc nhân viên phụ trách đã hết.
                    Vui lòng chọn ngày hoặc trung tâm khác.
                  </p>
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

                        <p
                          className={`mt-2 text-xs font-medium ${
                            selected ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          Còn {slot.remaining} suất
                        </p>
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
          {/* PICKUP AND RETURN */}
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
                      Boolean(String(value ?? "").trim()) ||
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
                disabled={
                  submitting ||
                  loadingSlots ||
                  loadingOptions ||
                  (isAuthenticated && loadingVehicles) ||
                  (isSavedMode && !selectedSavedVehicle)
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
