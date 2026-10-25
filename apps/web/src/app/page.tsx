"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";

type QuickBookingForm = {
  licensePlate: string;
  phone: string;
};

const steps = [
  {
    icon: <CarFront size={23} />,
    title: "Nhập thông tin xe",
    description: "Cung cấp biển số và thông tin liên hệ.",
  },
  {
    icon: <CalendarCheck size={23} />,
    title: "Chọn lịch phù hợp",
    description: "Chọn trung tâm, ngày và khung giờ còn trống.",
  },
  {
    icon: <ClipboardCheck size={23} />,
    title: "Xác nhận yêu cầu",
    description: "Xác thực số điện thoại để hoàn tất đăng ký.",
  },
];

export default function CustomerHomePage() {
  const methods = useForm<QuickBookingForm>({
    defaultValues: {
      licensePlate: "",
      phone: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: QuickBookingForm) => {
    console.log("Booking preview:", values);

    toast.info(
      "Biểu mẫu đã hoạt động. Chức năng đặt lịch sẽ được kết nối sau khi hoàn thiện API."
    );
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">
              <ShieldCheck size={17} />
              Dịch vụ hỗ trợ đăng kiểm xe
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Đặt lịch đăng kiểm xe dễ dàng, nhanh chóng
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-blue-100">
              Chủ động lựa chọn lịch đăng kiểm tại các trung tâm liên kết. Có
              thể yêu cầu nhân viên đến nhận xe và hỗ trợ đưa xe đi đăng kiểm.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
              >
                Đặt lịch đăng kiểm
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/lookup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Tra cứu booking
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Bắt đầu đặt lịch
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Điền thông tin cơ bản để kiểm tra biểu mẫu.
            </p>

            <HForm
              methods={methods}
              onSubmit={onSubmit}
              className="mt-6 space-y-5"
            >
              <HTextField<QuickBookingForm>
                name="licensePlate"
                label="Biển số xe"
                placeholder="Ví dụ: 43A-123.45"
                required
                rules={{
                  required: "Vui lòng nhập biển số xe",
                }}
              />

              <HTextField<QuickBookingForm>
                name="phone"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                type="tel"
                required
                rules={{
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^0\d{9}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                }}
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800"
              >
                Kiểm tra biểu mẫu
                <ArrowRight size={19} />
              </button>
            </HForm>

            <p className="mt-4 text-center text-xs text-slate-400">
              Không cần đăng ký tài khoản để đặt lịch.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Quy trình đặt lịch đơn giản
          </h2>
          <p className="mt-3 text-slate-500">
            Ba bước để gửi yêu cầu đặt lịch đăng kiểm xe.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  {step.icon}
                </div>
                <span className="text-sm font-bold text-slate-300">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <MapPin size={18} className="text-blue-700" />
          Dự kiến triển khai đầu tiên tại Đà Nẵng
        </div>
      </section>
    </>
  );
}
