"use client";

import { Container } from "@/components/ui/container";
import { CartView } from "./cart-view";
import { useCartStore } from "@/store/cart-store";

export function CartPage() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <Container size="lg" className="py-8 md:py-12">
      <h1 className="text-2xl font-bold text-neutral-950 lg:text-3xl">Your Cart</h1>
      {itemCount > 0 && (
        <p className="mt-1 text-sm text-neutral-500">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      )}
      <div className="mt-6">
        <CartView />
      </div>
    </Container>
  );
}
