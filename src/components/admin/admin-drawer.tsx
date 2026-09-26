"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth";
import { ADMIN_NAV_ITEMS, isActiveRoute } from "./admin-nav";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  user: SessionPayload;
}

export function AdminDrawer({ open, onClose, user }: AdminDrawerProps) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal={open}
        aria-label="Admin menu"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 pt-[env(safe-area-inset-top)]">
          <Link
            href="/admin"
            onClick={onClose}
            aria-label="MOTOMAN Admin"
            className="flex items-center"
          >
            <Image
              src="/logo.png"
              alt=""
              width={2172}
              height={724}
              className="h-7 w-auto"
            />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Menu
          </p>
          <ul>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = isActiveRoute(item.href, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "mx-3 flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-3 mt-4 border-t border-neutral-100 pt-3">
            <Link
              href="/"
              target="_blank"
              onClick={onClose}
              className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              <span>View Store</span>
            </Link>
          </div>
        </nav>

        {/* Account */}
        <div className="border-t border-neutral-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {user.name || "Admin"}
              </p>
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logoutAction()}
            className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}
