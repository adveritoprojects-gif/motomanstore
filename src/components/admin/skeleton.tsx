import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return <div className={cn("rounded bg-neutral-200/70", className)} />;
}

/**
 * Loading placeholder that mirrors the mobile card layout and the desktop
 * table layout, so neither breakpoint flashes an empty white box.
 */
export function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* Mobile: card skeletons */}
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex gap-3">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-neutral-200/70" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <Bar className="h-4 w-2/3" />
                <Bar className="h-3 w-1/3" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Bar className="h-4 w-24" />
              <Bar className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table skeleton */}
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white lg:block">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex gap-8">
            <Bar className="h-3 w-24" />
            <Bar className="h-3 w-20" />
            <Bar className="h-3 w-20" />
            <Bar className="h-3 w-20" />
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4 py-3.5">
              <Bar className="h-4 w-40" />
              <Bar className="h-4 w-24" />
              <Bar className="h-4 w-16" />
              <Bar className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
