"use client";

import { Loader2 } from "lucide-react";

interface HLoadingProps {
  loading?: boolean;
  text?: string;
  fullScreen?: boolean;
}

export function HLoading({
  loading = true,
  text = "Đang tải...",
  fullScreen = false,
}: HLoadingProps) {
  if (!loading) return null;

  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80"
          : "flex min-h-40 items-center justify-center"
      }
    >
      <div
        role="status"
        className="flex flex-col items-center gap-3 text-blue-600"
      >
        <Loader2 size={30} className="animate-spin" />
        <span className="text-sm font-medium text-slate-600">{text}</span>
      </div>
    </div>
  );
}
