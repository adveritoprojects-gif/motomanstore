"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { SessionPayload } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { AdminBottomNav } from "./admin-bottom-nav";
import { AdminDrawer } from "./admin-drawer";

interface AdminShellProps {
  user: SessionPayload;
  children: ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // In-app navigation closes the drawer through the link/click handlers.
  // Browser back/forward is handled here so the drawer never outlives the page.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [menuOpen]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar user={user} />

      {/* min-w-0 stops wide children (e.g. filter chip rows) from inflating
          this flex column past the viewport on small screens. */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <AdminTopbar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pb-[calc(5rem_+_env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-[calc(5rem_+_env(safe-area-inset-bottom))] md:pt-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <AdminBottomNav onMoreClick={() => setMenuOpen(true)} />
      <AdminDrawer open={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
    </div>
  );
}
