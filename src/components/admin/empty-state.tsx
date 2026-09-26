"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  title,
  message,
  icon,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 flex justify-center text-neutral-300">{icon}</div>}
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
