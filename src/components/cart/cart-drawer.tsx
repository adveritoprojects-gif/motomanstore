"use client";

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const getTotalItems = useCartStore((s) => s.getTotalItems);

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

  if (!isOpen) return null;

  const total = getTotalPrice();
  const itemCount = getTotalItems();

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-left">
        {/* Header */}
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
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag className="h-10 w-10 text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-600">
              Your cart is empty
            </p>
            <p className="text-center text-xs text-neutral-400">
              Add items to get started with your premium car care routine.
            </p>
            <button
              onClick={closeCart}
              className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.variantId ?? "default"}`}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-neutral-300" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {item.name}
                        </p>
                        {item.variantName && (
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {item.variantName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-md border border-neutral-200">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.id, item.variantId)
                            }
                            className="flex h-7 w-7 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center border-x border-neutral-200 text-xs font-medium text-neutral-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              increaseQuantity(item.id, item.variantId)
                            }
                            className={cn(
                              "flex h-7 w-7 items-center justify-center transition-colors",
                              item.maxStock && item.quantity >= item.maxStock
                                ? "cursor-not-allowed text-neutral-300"
                                : "text-neutral-500 hover:text-neutral-700"
                            )}
                            disabled={
                              !!item.maxStock && item.quantity >= item.maxStock
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-neutral-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id, item.variantId)}
                            className="text-xs text-neutral-400 underline decoration-dashed underline-offset-2 transition-colors hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-neutral-500">Subtotal</span>
                <span className="text-lg font-bold text-neutral-950">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mb-4 text-xs text-neutral-400">
                Shipping and taxes calculated at checkout
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 flex w-full items-center justify-center py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
