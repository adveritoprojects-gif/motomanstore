/** Matches checkout validation: quantity is an integer from 1 to 10. */
export const MAX_CART_QUANTITY = 10;

export function cartLineKey(id: string, variantId?: string) {
  return `${id}::${variantId ?? ""}`;
}

export function quantityCap(maxStock?: number) {
  if (typeof maxStock === "number" && Number.isFinite(maxStock)) {
    return Math.max(0, Math.min(Math.floor(maxStock), MAX_CART_QUANTITY));
  }
  return MAX_CART_QUANTITY;
}

export type QuantityChange =
  | { ok: true; quantity: number }
  | { ok: false; message: string };

export function changeQuantity(
  current: number,
  direction: "increase" | "decrease",
  maxStock?: number,
): QuantityChange {
  const cap = quantityCap(maxStock);

  if (direction === "decrease") {
    if (current <= 1) {
      return {
        ok: false,
        message: "Quantity cannot be less than 1. Use remove to delete this item.",
      };
    }
    return { ok: true, quantity: current - 1 };
  }

  if (cap <= 0) {
    return { ok: false, message: "This item is out of stock." };
  }
  if (current >= cap) {
    const limitedByStock =
      typeof maxStock === "number" && maxStock < MAX_CART_QUANTITY;
    return {
      ok: false,
      message: limitedByStock
        ? `Only ${cap} available.`
        : `Maximum quantity is ${cap}.`,
    };
  }
  return { ok: true, quantity: current + 1 };
}
