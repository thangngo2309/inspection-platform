"use client";

import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { MenuItem, TextField, type TextFieldProps } from "@mui/material";

export interface HSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

type HSelectProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "select" | "children"
> & {
  name: Path<T>;
  options: HSelectOption[];
};

export function HSelect<T extends FieldValues>({
  name,
  options,
  helperText,
  ...props
}: HSelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          select
          value={field.value ?? ""}
          fullWidth={props.fullWidth ?? true}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
