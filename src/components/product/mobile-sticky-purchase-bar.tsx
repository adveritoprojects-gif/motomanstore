"use client";

import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface MobileStickyPurchaseBarProps {
  price: number;
  compareAtPrice?: number | null;
  inStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function MobileStickyPurchaseBar({
  price,
  compareAtPrice,
  inStock,
  onAddToCart,
  onBuyNow,
}: MobileStickyPurchaseBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-neutral-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex items-center gap-3">
        {/* Price */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-950">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAddToCart}
            disabled={!inStock}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
          <button
            onClick={onBuyNow}
            disabled={!inStock}
            className="flex h-10 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
