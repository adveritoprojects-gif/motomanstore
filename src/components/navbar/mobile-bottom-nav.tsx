"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Grid3X3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/collections", label: "Categories", icon: Grid3X3 },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-orange-500" : "text-neutral-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
