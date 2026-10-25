"use client";

import type { ReactNode } from "react";
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

interface HFormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  className?: string;
}

export function HForm<T extends FieldValues>({
  methods,
  onSubmit,
  children,
  className,
}: HFormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className={className}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
}
