export interface CheckoutCartLine {
  id: string;
  name: string;
  quantity: number;
  variantId?: string;
  /** Ignored. Prices always come from the product record. */
  price?: number;
}

/** Flat handling charge applied to Cash on Delivery orders only. */
export const COD_HANDLING_FEE = 20;

export type PaymentMethod = "cod" | "razorpay";

/** COD adds a handling fee; online payments never do. */
export function codHandlingFee(method: PaymentMethod): number {
  return method === "cod" ? COD_HANDLING_FEE : 0;
}

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  codFee: number;
  total: number;
}

/**
 * Server-authoritative order totals. The COD handling fee is included in the
 * total so the amount charged / recorded always matches what was displayed.
 */
export function orderTotals(
  subtotal: number,
  method: PaymentMethod,
  shippingCost = 0,
): OrderTotals {
  const codFee = codHandlingFee(method);
  return {
    subtotal,
    shippingCost,
    codFee,
    total: subtotal + shippingCost + codFee,
  };
}

export interface CheckoutProductRecord {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  images: { url: string }[];
  variants: { id: string; name: string; price: number | null; stock: number }[];
}

export interface PricedOrderLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId: string;
}

export type PriceCartResult =
  | { ok: true; items: PricedOrderLine[]; subtotal: number }
  | { ok: false; error: string };

export function priceCart(
  cartItems: CheckoutCartLine[],
  dbProducts: CheckoutProductRecord[],
): PriceCartResult {
  if (cartItems.length === 0) {
    return { ok: false, error: "Cart cannot be empty" };
  }

  const items: PricedOrderLine[] = [];
  let subtotal = 0;

  for (const cartItem of cartItems) {
    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > 10) {
      return { ok: false, error: "Quantity must be between 1 and 10" };
    }

    const dbProduct = dbProducts.find((product) => product.id === cartItem.id);
    if (!dbProduct) {
      return {
        ok: false,
        error: `Product "${cartItem.name}" is no longer available`,
      };
    }

    if (!dbProduct.inStock) {
      return { ok: false, error: `"${dbProduct.name}" is currently out of stock` };
    }

    if (!cartItem.variantId || dbProduct.variants.length === 0) {
      return {
        ok: false,
        error: `Please re-add "${dbProduct.name}" to your cart.`,
      };
    }

    const variant = dbProduct.variants.find((entry) => entry.id === cartItem.variantId);
    if (!variant) {
      return {
        ok: false,
        error: `Variant for "${dbProduct.name}" is no longer available`,
      };
    }
    if (variant.stock < cartItem.quantity) {
      return {
        ok: false,
        error: `Only ${variant.stock} units of "${dbProduct.name} - ${variant.name}" are available`,
      };
    }

    const itemPrice = variant.price ?? dbProduct.price;
    const itemName = `${dbProduct.name} - ${variant.name}`;

    subtotal += itemPrice * cartItem.quantity;
    items.push({
      productId: dbProduct.id,
      name: itemName,
      price: itemPrice,
      quantity: cartItem.quantity,
      image: dbProduct.images[0]?.url || "/placeholder-product.jpg",
      variantId: variant.id,
    });
  }

  return { ok: true, items, subtotal };
}

export function captureDecision(
  orderStatus: string,
  amountsMatch: boolean,
  currencyIsInr = true,
): "skip" | "ignore-amount" | "capture" {
  if (
    orderStatus === "paid" ||
    orderStatus === "processing" ||
    orderStatus === "shipped" ||
    orderStatus === "delivered" ||
    orderStatus === "cancelled" ||
    orderStatus === "refunded"
  ) {
    return "skip";
  }
  if (!amountsMatch || !currencyIsInr) return "ignore-amount";
  if (orderStatus !== "pending") return "skip";
  return "capture";
}

export function paymentCurrencyMatches(currency: unknown): boolean {
  return typeof currency === "string" && currency.toUpperCase() === "INR";
}

export function paymentMethodAvailable(
  method: "cod" | "razorpay",
  razorpayConfigured: boolean,
): { ok: true } | { ok: false; error: string } {
  if (method === "cod") return { ok: true };
  if (!razorpayConfigured) {
    return {
      ok: false,
      error: "Online payment is unavailable. You can still place a cash on delivery order.",
    };
  }
  return { ok: true };
}

export function paymentAmountMatches(orderTotalInr: number, amountPaise: number): boolean {
  if (!Number.isFinite(orderTotalInr) || !Number.isFinite(amountPaise)) return false;
  return amountPaise === Math.round(orderTotalInr * 100);
}

export function paymentMethodLabel(method: string | null | undefined): string {
  if (method === "cod") return "Cash on Delivery";
  if (method === "razorpay") return "Razorpay";
  if (!method) return "Online";
  return method;
}
