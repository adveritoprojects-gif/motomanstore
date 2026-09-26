"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { getPageTitle } from "./admin-nav";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-neutral-200 bg-white px-3 pt-[env(safe-area-inset-top)] md:px-6 lg:px-8">
      {/* Mobile: hamburger + brand/page title */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <Link
          href="/admin"
          aria-label="MOTOMAN Admin"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt=""
            width={2172}
            height={724}
            className="h-6 w-auto"
          />
        </Link>
        <span className="hidden h-4 w-px bg-neutral-200 sm:block" />
        <span className="hidden truncate text-sm font-medium text-neutral-500 sm:block">
          {pageTitle}
        </span>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 sm:inline-flex"
        >
          View Store
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
      </div>
    </header>
  );
}
