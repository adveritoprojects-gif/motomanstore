"use client";

import { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { CartView } from "./cart-view";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const itemCount = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.quantity, 0),
  );

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={closeCart}
        aria-label="Close cart"
      />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-neutral-700" />
            <h2 className="text-lg font-bold text-neutral-950">Your Cart</h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
          <CartView onNavigate={closeCart} />
        </div>
      </div>
    </div>
  );
}
