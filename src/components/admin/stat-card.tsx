import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-neutral-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-bold text-neutral-950 sm:text-2xl">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 truncate text-xs font-medium",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-neutral-500"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 sm:h-10 sm:w-10">
          {icon}
        </div>
      </div>
    </div>
  );
}
