"use client";

import Link from "next/link";
import { Store, Bell } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 lg:px-8">
      {/* Mobile Logo */}
      <Link href="/admin" className="flex items-center gap-2 lg:hidden">
        <Store className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-bold tracking-wider text-neutral-950">
          MOTOMAN
        </span>
      </Link>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          View Store
        </Link>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
      </div>
    </header>
  );
}
