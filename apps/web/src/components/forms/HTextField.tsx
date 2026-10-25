"use client";

import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

interface HTextFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
}

export function HTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  disabled,
  required,
  rules,
}: HTextFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <label
            htmlFor={name}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>

          <input
            id={name}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ""}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!fieldState.error}
            className={[
              "w-full rounded-xl border px-4 py-3 text-sm",
              "bg-white text-slate-900 outline-none",
              "transition focus:ring-2",
              fieldState.error
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
              disabled ? "bg-slate-100 opacity-60" : "",
            ].join(" ")}
          />

          {fieldState.error && (
            <p className="text-xs text-red-600">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
