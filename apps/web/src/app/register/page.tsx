"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, CarFront, Loader2, UserRoundPlus } from "lucide-react";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";

import { authRepository } from "@/lib/repositories/auth.repository";
import { saveAuth } from "@/lib/auth";

type RegisterForm = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const methods = useForm<RegisterForm>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setLoading(true);

    try {
      const result = await authRepository.register({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        password: values.password,
      });

      saveAuth(result);

      toast.success("Đăng ký tài khoản thành công");
      router.replace("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể đăng ký tài khoản"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <CarFront size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Tạo tài khoản
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quản lý xe và lịch sử đặt đăng kiểm thuận tiện hơn
          </p>
        </div>

        <HForm methods={methods} onSubmit={onSubmit} className="space-y-5">
          <HTextField<RegisterForm>
            name="fullName"
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            required
            rules={{
              required: "Vui lòng nhập họ và tên",
              minLength: {
                value: 2,
                message: "Họ tên phải có ít nhất 2 ký tự",
              },
            }}
          />

          <HTextField<RegisterForm>
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

          <HTextField<RegisterForm>
            name="email"
            label="Email (không bắt buộc)"
            placeholder="example@gmail.com"
            type="email"
            rules={{
              validate: (value) =>
                !value ||
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                "Email không hợp lệ",
            }}
          />

          <HTextField<RegisterForm>
            name="password"
            label="Mật khẩu"
            placeholder="Tối thiểu 8 ký tự"
            type="password"
            required
            rules={{
              required: "Vui lòng nhập mật khẩu",
              minLength: {
                value: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
            }}
          />

          <HTextField<RegisterForm>
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            type="password"
            required
            rules={{
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) =>
                value === methods.getValues("password") ||
                "Mật khẩu xác nhận không khớp",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <UserRoundPlus size={19} />
            )}
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </HForm>

        <p className="mt-7 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  );
}
