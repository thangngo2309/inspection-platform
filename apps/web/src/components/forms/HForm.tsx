
"use client";

import type { ReactNode } from "react";
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type SubmitErrorHandler,
  type UseFormReturn,
} from "react-hook-form";

interface HFormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function HForm<T extends FieldValues>({
  methods,
  onSubmit,
  onInvalid,
  children,
  className,
  id,
}: HFormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form
        id={id}
        noValidate
        className={className}
        onSubmit={methods.handleSubmit(
          onSubmit,
          onInvalid,
        )}
      >
        {children}
      </form>
    </FormProvider>
  );
}
