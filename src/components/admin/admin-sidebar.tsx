"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth";
import { ADMIN_NAV_ITEMS, isActiveRoute } from "./admin-nav";

interface AdminSidebarProps {
  user: SessionPayload;
}

/** Desktop-only sidebar. Mobile uses AdminDrawer + AdminBottomNav. */
export function AdminSidebar({ user }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-neutral-200 bg-white transition-all duration-300 lg:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center justify-between border-b border-neutral-200",
          collapsed ? "px-2" : "px-4"
        )}
      >
        {!collapsed && (
          <Link href="/admin" aria-label="MOTOMAN Admin">
            <Image
              src="/logo.png"
              alt=""
              width={2172}
              height={724}
              className="h-7 w-auto"
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" aria-label="MOTOMAN Admin" className="mx-auto">
            <Image
              src="/android-chrome-192x192.png"
              alt=""
              width={192}
              height={192}
              className="h-7 w-7"
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-neutral-600"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-neutral-200 p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {user.name || "Admin"}
              </p>
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => logoutAction()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
