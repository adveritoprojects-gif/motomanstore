"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, isActiveRoute } from "./admin-nav";

interface AdminBottomNavProps {
  onMoreClick: () => void;
}

export function AdminBottomNav({ onMoreClick }: AdminBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-orange-600"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {isActive && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-b bg-orange-500" />
                )}
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMoreClick}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
