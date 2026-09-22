"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

interface AdminSidebarProps {
  user: SessionPayload;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-neutral-200 bg-white transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold tracking-wider text-neutral-950">
                MOTOMAN
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <Store className="h-6 w-6 text-orange-500" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-neutral-600"
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
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
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
                <p className="truncate text-xs text-neutral-400">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => logoutAction()}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" />
    </>
  );
}
