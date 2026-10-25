"use client";

import type { ReactNode } from "react";
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
  type SubmitHandler,
} from "react-hook-form";

interface HFormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  id?: string;
  className?: string;
}

export function HForm<T extends FieldValues>({
  methods,
  onSubmit,
  children,
  id,
  className,
}: HFormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form
        id={id}
        className={className}
        noValidate
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
}
