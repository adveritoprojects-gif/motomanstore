"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  User,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, NAV_LINKS } from "@/lib/data";
import { useCartStore } from "@/store/cart-store";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-neutral-950 transition-all duration-300",
          isScrolled ? "shadow-lg" : ""
        )}
      >
        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white">
                {BRAND.name}
              </span>
            </Link>

            {/* Center: Nav Links */}
            <nav className="flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-orange-500"
                      : "text-neutral-300 hover:text-white"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-orange-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right: Search + Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <label htmlFor="navbar-search" className="sr-only">Search products</label>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                <input
                  id="navbar-search"
                  type="search"
                  placeholder="Search for products..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-9 w-[200px] rounded-lg border border-neutral-700 bg-neutral-900 pl-9 pr-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-orange-500"
                />
              </div>
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center text-neutral-300 transition-colors hover:text-white"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="relative flex h-9 w-9 items-center justify-center text-neutral-300 transition-colors hover:text-white"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setIsOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-white"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="text-lg font-bold tracking-wider text-white">
              {BRAND.name}
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="flex h-10 w-10 items-center justify-center text-white"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center text-white"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-neutral-950 animate-slide-in-right">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
                <span className="text-lg font-bold tracking-wider text-white">
                  {BRAND.name}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-orange-500 border-l-2 border-orange-500"
                        : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                    )}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-neutral-800 p-6">
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
