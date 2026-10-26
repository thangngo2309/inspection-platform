"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, CarFront, Loader2, LockKeyhole } from "lucide-react";

import { HForm } from "@/components/forms/HForm";
import { HTextField } from "@/components/forms/HTextField";

import { authRepository } from "@/lib/repositories/auth.repository";
import { saveAuth } from "@/lib/auth";

type LoginForm = {
  phone: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const methods = useForm<LoginForm>({
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);

    try {
      const result = await authRepository.login(values);
      saveAuth(result);

      toast.success("Đăng nhập thành công");
      router.replace("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <CarFront size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Đăng nhập
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quản lý phương tiện và lịch đặt đăng kiểm của bạn
          </p>
        </div>

        <HForm methods={methods} onSubmit={onSubmit} className="space-y-5">
          <HTextField<LoginForm>
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

          <HTextField<LoginForm>
            name="password"
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            required
            rules={{
              required: "Vui lòng nhập mật khẩu",
            }}
          />

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <ArrowRight size={19} />
            )}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </HForm>

        <div className="mt-7 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <LockKeyhole size={14} />
          Thông tin đăng nhập được truyền qua HTTPS khi triển khai
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Bạn vẫn có thể{" "}
          <Link href="/booking" className="font-semibold text-blue-700">
            đặt lịch không cần tài khoản
          </Link>
        </p>
      </div>
    </section>
  );
}
