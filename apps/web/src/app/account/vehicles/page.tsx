"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  myVehiclesRepository as repo,
  type SavedVehicle,
  type VehicleFormPayload,
} from "@/lib/repositories/my-vehicles.repository";

const TYPES = [
  { value: "car", label: "Ô tô con" },
  { value: "truck", label: "Xe tải" },
  { value: "bus", label: "Xe khách" },
];

const emptyForm = {
  licensePlate: "",
  vehicleType: "car",
  brand: "",
  model: "",
  manufactureYear: "",
  chassisNumber: "",
  engineNumber: "",
  seats: "",
  payloadKg: "",
  inspectionExpiryDate: "",
  insuranceExpiryDate: "",
  note: "",
};

type VehicleFormState = typeof emptyForm;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 " +
  "text-sm text-slate-900 outline-none focus:border-blue-600 " +
  "focus:ring-2 focus:ring-blue-100";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Không thể thực hiện thao tác.";
}

function toForm(vehicle: SavedVehicle): VehicleFormState {
  return {
    licensePlate: vehicle.licensePlate,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand ?? "",
    model: vehicle.model ?? "",
    manufactureYear: vehicle.manufactureYear?.toString() ?? "",
    chassisNumber: vehicle.chassisNumber ?? "",
    engineNumber: vehicle.engineNumber ?? "",
    seats: vehicle.seats?.toString() ?? "",
    payloadKg: vehicle.payloadKg ?? "",
    inspectionExpiryDate: vehicle.inspectionExpiryDate?.slice(0, 10) ?? "",
    insuranceExpiryDate: vehicle.insuranceExpiryDate?.slice(0, 10) ?? "",
    note: vehicle.note ?? "",
  };
}

function toPayload(form: VehicleFormState): VehicleFormPayload {
  return {
    licensePlate: form.licensePlate.trim().toUpperCase(),
    vehicleType: form.vehicleType,
    brand: form.brand.trim() || undefined,
    model: form.model.trim() || undefined,
    manufactureYear: form.manufactureYear
      ? Number(form.manufactureYear)
      : undefined,
    chassisNumber: form.chassisNumber.trim() || undefined,
    engineNumber: form.engineNumber.trim() || undefined,
    seats: form.seats ? Number(form.seats) : undefined,
    payloadKg: form.payloadKg.trim() || undefined,
    inspectionExpiryDate: form.inspectionExpiryDate || undefined,
    insuranceExpiryDate: form.insuranceExpiryDate || undefined,
    note: form.note.trim() || undefined,
  };
}

function VehicleDialog({
  vehicle,
  onClose,
  onSaved,
}: {
  vehicle: SavedVehicle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<VehicleFormState>(
    vehicle ? toForm(vehicle) : { ...emptyForm }
  );
  const [submitting, setSubmitting] = useState(false);

  const set = (name: keyof VehicleFormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.licensePlate.trim()) {
      toast.error("Vui lòng nhập biển số xe");
      return;
    }

    setSubmitting(true);

    try {
      const payload = toPayload(form);

      if (vehicle) {
        await repo.update(vehicle.id, payload);
        toast.success("Đã cập nhật phương tiện");
      } else {
        await repo.create(payload);
        toast.success("Đã thêm phương tiện");
      }

      onSaved();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const fields: Array<{
    name: keyof VehicleFormState;
    label: string;
    type?: string;
    placeholder?: string;
  }> = [
    {
      name: "licensePlate",
      label: "Biển số xe *",
      placeholder: "43A-123.45",
    },
    { name: "brand", label: "Hãng xe", placeholder: "Toyota" },
    { name: "model", label: "Dòng xe", placeholder: "Innova" },
    {
      name: "manufactureYear",
      label: "Năm sản xuất",
      type: "number",
    },
    {
      name: "seats",
      label: "Số chỗ ngồi",
      type: "number",
    },
    { name: "payloadKg", label: "Tải trọng (kg)" },
    { name: "chassisNumber", label: "Số khung" },
    { name: "engineNumber", label: "Số máy" },
    {
      name: "inspectionExpiryDate",
      label: "Ngày hết hạn đăng kiểm",
      type: "date",
    },
    {
      name: "insuranceExpiryDate",
      label: "Ngày hết hạn bảo hiểm",
      type: "date",
    },
  ];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-dialog-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2
            id="vehicle-dialog-title"
            className="text-lg font-extrabold text-slate-900"
          >
            {vehicle ? "Chỉnh sửa phương tiện" : "Thêm xe mới"}
          </h2>

          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(event) => void submit(event)}
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Loại xe *
              <select
                value={form.vehicleType}
                onChange={(e) => set("vehicleType", e.target.value)}
                className={`${inputClass} mt-2`}
                required
              >
                {TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {fields.map((field) => (
              <label
                key={field.name}
                className="block text-sm font-semibold text-slate-700"
              >
                {field.label}
                <input
                  className={`${inputClass} mt-2`}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                  required={field.name === "licensePlate"}
                  min={
                    field.name === "manufactureYear"
                      ? 1900
                      : field.name === "seats"
                      ? 1
                      : undefined
                  }
                />
              </label>
            ))}

            <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
              Ghi chú
              <textarea
                rows={3}
                className={`${inputClass} mt-2`}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Thông tin cần lưu thêm về phương tiện"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {vehicle ? "Lưu thay đổi" : "Thêm phương tiện"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyVehiclesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SavedVehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["my-vehicles"],
    queryFn: repo.list,
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const remove = async (vehicle: SavedVehicle) => {
    if (!window.confirm(`Bạn có chắc muốn xóa xe ${vehicle.licensePlate}?`)) {
      return;
    }

    setDeleting(vehicle.id);

    try {
      await repo.remove(vehicle.id);
      toast.success("Đã xóa phương tiện");
      await queryClient.invalidateQueries({
        queryKey: ["my-vehicles"],
      });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-[75vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/account/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
            >
              <ArrowLeft size={17} />
              Tài khoản của tôi
            </Link>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
              Xe của tôi
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Lưu thông tin phương tiện để đặt lịch nhanh hơn.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            Thêm xe
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-200 pb-4 text-sm font-semibold">
          <Link
            href="/account/bookings"
            className="rounded-xl bg-white px-4 py-3 text-slate-600"
          >
            Booking của tôi
          </Link>
          <Link
            href="/account/vehicles"
            className="rounded-xl bg-blue-700 px-4 py-3 text-white"
          >
            Xe của tôi
          </Link>
          <Link
            href="/account/history"
            className="rounded-xl bg-white px-4 py-3 text-slate-600"
          >
            Lịch sử đăng kiểm
          </Link>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
            <Loader2 className="animate-spin" />
            Đang tải danh sách xe...
          </div>
        ) : isError ? (
          <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Không tải được danh sách xe.
            <button
              type="button"
              onClick={() => void refetch()}
              className="ml-3 font-bold underline"
            >
              Thử lại
            </button>
          </div>
        ) : !data?.length ? (
          <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CarFront size={40} className="mx-auto text-blue-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Bạn chưa lưu phương tiện nào
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thêm xe để sử dụng lại thông tin khi đặt lịch.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((vehicle) => (
              <article
                key={vehicle.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <CarFront size={24} />
                  </div>

                  <span className="text-xs text-slate-500">
                    {TYPES.find((type) => type.value === vehicle.vehicleType)
                      ?.label ?? vehicle.vehicleType}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                  {vehicle.licensePlate}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
                    "Chưa có thông tin hãng và dòng xe"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(vehicle);
                      setDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Pencil size={15} />
                    Chỉnh sửa
                  </button>

                  <button
                    type="button"
                    disabled={deleting === vehicle.id}
                    onClick={() => void remove(vehicle)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Xóa
                  </button>

                  <Link
                    href={`/account/vehicles/${vehicle.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                  >
                    <CalendarDays size={15} />
                    Lịch sử
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {dialogOpen && (
          <VehicleDialog
            key={editing?.id ?? "new"}
            vehicle={editing}
            onClose={closeDialog}
            onSaved={() => {
              closeDialog();
              void queryClient.invalidateQueries({
                queryKey: ["my-vehicles"],
              });
            }}
          />
        )}
      </div>
    </main>
  );
}
