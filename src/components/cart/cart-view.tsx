"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cartLineKey, quantityCap } from "@/lib/cart/quantity";
import { cn, formatPrice } from "@/lib/utils";

function CartLine({
  item,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variantId?: string;
    variantName?: string;
    maxStock?: number;
  };
}) {
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cap = quantityCap(item.maxStock);
  const hasImage = Boolean(item.image) && item.image !== "/placeholder-product.jpg";

  function run(action: () => string | null | boolean) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const result = action();
    if (typeof result === "string" && result) setNotice(result);
    if (result === false) setNotice("Could not remove this item. Please try again.");
    setBusy(false);
  }

  return (
    <div className="flex gap-3 border-b border-neutral-200 py-4 last:border-b-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {hasImage ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-950">{item.name}</p>
            {item.variantName && (
              <p className="mt-0.5 text-xs text-neutral-500">{item.variantName}</p>
            )}
          </div>
          <p className="shrink-0 text-sm font-semibold text-neutral-950">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => run(() => decreaseQuantity(item.id, item.variantId))}
              disabled={busy || item.quantity <= 1}
              className="flex h-11 w-11 items-center justify-center text-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-300"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className="flex h-11 w-10 items-center justify-center border-x border-neutral-200 text-sm font-semibold text-neutral-950"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => run(() => increaseQuantity(item.id, item.variantId))}
              disabled={busy || item.quantity >= cap}
              className="flex h-11 w-11 items-center justify-center text-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-300"
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => run(() => removeItem(item.id, item.variantId))}
            disabled={busy}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-neutral-500 transition-colors hover:text-red-600 disabled:opacity-50"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
        {notice && <p className="mt-2 text-xs text-red-600">{notice}</p>}
      </div>
    </div>
  );
}

export function CartView({
  showCheckout = true,
  onNavigate,
}: {
  showCheckout?: boolean;
  onNavigate?: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingBag className="h-10 w-10 text-neutral-300" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-950">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Add a Motoman product to start your order. Shipping is free.
        </p>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-end px-1">
        {confirmClear ? (
          <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
            <p className="text-sm text-neutral-700">Remove every item from your cart?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="h-11 rounded-lg px-3 text-sm font-medium text-neutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setConfirmClear(false);
                }}
                className="h-11 rounded-lg bg-neutral-950 px-3 text-sm font-semibold text-white"
              >
                Clear cart
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="mb-1 h-11 text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.map((item) => (
          <CartLine key={cartLineKey(item.id, item.variantId)} item={item} />
        ))}
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Subtotal</span>
          <span className="text-lg font-bold text-neutral-950">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">Free shipping on all orders</p>
        {showCheckout && (
          <Link
            href="/checkout"
            onClick={onNavigate}
            className={cn(
              "mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600",
            )}
          >
            Proceed to Checkout
          </Link>
        )}
        <Link
          href="/shop"
          onClick={onNavigate}
          className="mt-2 flex h-11 w-full items-center justify-center text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
