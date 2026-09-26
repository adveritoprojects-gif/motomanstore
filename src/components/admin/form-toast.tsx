"use client";

import { cn } from "@/lib/utils";

interface FormToastProps {
  type: "success" | "error";
  text: string;
}

/**
 * Inline feedback banner on desktop; on mobile it floats above the fixed
 * bottom navigation so it can never be hidden behind it.
 */
export function FormToast({ type, text }: FormToastProps) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "fixed inset-x-4 z-50 rounded-xl p-3.5 text-sm font-medium shadow-lg lg:static lg:inset-auto lg:mb-6 lg:rounded-lg lg:p-3 lg:shadow-none",
        "bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] lg:bottom-auto",
        type === "success"
          ? "bg-green-50 text-green-700 lg:bg-green-50 lg:text-green-600"
          : "bg-red-50 text-red-700 lg:bg-red-50 lg:text-red-600"
      )}
    >
      {text}
    </div>
  );
}
