"use client";

import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type HTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  rules?: RegisterOptions<T, Path<T>>;

  // Hỗ trợ nhập liệu nhiều dòng
  multiline?: boolean;
  rows?: number;

  // Hỗ trợ cấu hình input HTML
  slotProps?: {
    htmlInput?: InputHTMLAttributes<HTMLInputElement>;
  };

  // Thuộc tính tùy chọn
  className?: string;
  helperText?: string;
  autoComplete?: string;
};

export function HTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  rules,
  multiline = false,
  rows = 3,
  slotProps,
  className,
  helperText,
  autoComplete,
}: HTextFieldProps<T>) {
  const { control } = useFormContext<T>();

  const inputClassName = [
    "w-full rounded-xl border bg-white px-4 py-3",
    "text-sm text-slate-900 outline-none transition-all",
    "placeholder:text-slate-400",
    "focus:ring-4",
    "disabled:cursor-not-allowed disabled:bg-slate-100",
    className ?? "",
  ].join(" ");

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error);

        const borderClass = hasError
          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-blue-600 focus:ring-blue-100";

        return (
          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor={name}
              className="block text-sm font-semibold text-slate-700"
            >
              {label}

              {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {multiline ? (
              <textarea
                id={name}
                name={field.name}
                ref={field.ref}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                placeholder={placeholder}
                rows={rows}
                autoComplete={autoComplete}
                aria-invalid={hasError}
                className={[inputClassName, borderClass, "resize-y"].join(" ")}
              />
            ) : (
              <input
                {...slotProps?.htmlInput}
                id={name}
                name={field.name}
                ref={field.ref}
                type={type}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={hasError}
                className={[inputClassName, borderClass].join(" ")}
              />
            )}

            {(fieldState.error?.message || helperText) && (
              <p
                className={`text-xs ${
                  hasError ? "text-red-600" : "text-slate-500"
                }`}
              >
                {fieldState.error?.message ?? helperText}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
