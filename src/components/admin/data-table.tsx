"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminEmptyState } from "./empty-state";

interface AdminDataTableProps<T> {
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  /** Mobile card renderer. When provided, the desktop table is hidden below `lg`. */
  renderMobile?: (item: T) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AdminDataTable<T extends Record<string, any> = Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
  emptyAction,
  renderMobile,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return <AdminEmptyState title={emptyMessage} action={emptyAction} />;
  }

  return (
    <>
      {/* Desktop: table */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-neutral-200 bg-white",
          renderMobile && "hidden lg:block"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors hover:bg-neutral-50",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 text-sm text-neutral-700", col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: cards */}
      {renderMobile && (
        <div className="space-y-3 lg:hidden">
          {data.map((item, i) => (
            <div
              key={i}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
                onRowClick && "cursor-pointer active:bg-neutral-50"
              )}
            >
              {renderMobile(item)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
