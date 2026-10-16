"use server";

import type { Prisma } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkoutRequestSchema, cartSchema } from "@/lib/validations";
import type { CheckoutRequestData, CartItemInput } from "@/lib/validations";
import { orderTotals, paymentMethodAvailable, priceCart } from "@/lib/checkout/price-cart";
import { InsufficientStockError, reserveInventory } from "@/lib/checkout/inventory";
import { sendOrderConfirmationEmail } from "@/lib/email";

function generateOrderNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MT-${datePart}-${randomPart}`;
}

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      amount: number;
      paymentMethod: "cod";
    }
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      amount: number;
      paymentMethod: "razorpay";
      razorpayOrderId: string;
    }
  | { success: false; error: string };

function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function isAttemptConflict(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  if ((error as { code?: string }).code !== "P2002") return false;
  const target = (error as { meta?: { target?: unknown } }).meta?.target;
  const text = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return text.includes("checkoutAttemptId");
}

async function notifyPlacedOrder(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  codFee?: number;
  total: number;
  shippingAddress: unknown;
  items: { name: string; quantity: number; price: number }[];
  paymentNote?: string;
}) {
  if (!order.customerEmail) return;
  const shippingAddress = order.shippingAddress as Record<string, string>;
  try {
    await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      codFee: order.codFee,
      total: order.total,
      paymentNote: order.paymentNote,
      shippingAddress: {
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2,
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "India",
      },
    });
  } catch {
    // Email is optional. A missing provider must not fail the order.
  }
}

const orderInclude = {
  items: true,
  payments: true,
} as const;

type CheckoutOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export async function createOrder(
  checkoutData: CheckoutRequestData,
  cartItems: CartItemInput[],
): Promise<CreateOrderResult> {
  try {
    const validatedCheckout = checkoutRequestSchema.safeParse(checkoutData);
    if (!validatedCheckout.success) {
      return {
        success: false,
        error: validatedCheckout.error.issues[0]?.message || "Invalid checkout data",
      };
    }

    const validatedCart = cartSchema.safeParse({ items: cartItems });
    if (!validatedCart.success) {
      return {
        success: false,
        error: validatedCart.error.issues[0]?.message || "Invalid cart data",
      };
    }

    const checkout = validatedCheckout.data;
    const availability = paymentMethodAvailable(
      checkout.paymentMethod,
      razorpayConfigured(),
    );
    if (!availability.ok) {
      return { success: false, error: availability.error };
    }

    const productIds = [...new Set(cartItems.map((item) => item.id))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    });

    const priced = priceCart(cartItems, dbProducts);
    if (!priced.ok) {
      return { success: false, error: priced.error };
    }

    const shippingCost = 0;
    // COD adds the flat handling fee; online (Razorpay) orders never include it.
    const totals = orderTotals(priced.subtotal, checkout.paymentMethod, shippingCost);
    const total = totals.total;
    // Simple products (no variants) have no stock row to reserve — only the
    // product-level inStock gate, which priceCart already checked.
    const stockLines = priced.items
      .filter((item): item is typeof item & { variantId: string } => item.variantId !== null)
      .map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
      }));

    let created = false;
    let order: CheckoutOrder;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.order.findUnique({
          where: { checkoutAttemptId: checkout.attemptId },
          include: orderInclude,
        });
        if (existing) return { created: false, order: existing };

        await reserveInventory(tx, stockLines);

        const placed = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            checkoutAttemptId: checkout.attemptId,
            inventoryHeld: true,
            status: "pending",
            subtotal: priced.subtotal,
            shippingCost,
            codFee: totals.codFee,
            total,
            shippingAddress: JSON.parse(JSON.stringify(checkout)),
            customerEmail: checkout.email ?? "",
            customerName: [checkout.firstName, checkout.lastName].filter(Boolean).join(" "),
            customerPhone: checkout.phone,
            notes: checkout.notes,
            items: { create: priced.items },
            payments: {
              create: {
                amount: total,
                currency: "INR",
                status: "pending",
                method: checkout.paymentMethod,
                metadata: {
                  attemptId: checkout.attemptId,
                  codFee: totals.codFee,
                },
              },
            },
          },
          include: orderInclude,
        });
        return { created: true, order: placed };
      }, TX_OPTIONS);
      created = result.created;
      order = result.order;
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return { success: false, error: error.message };
      }
      if (!isAttemptConflict(error)) throw error;

      const existing = await prisma.order.findUnique({
        where: { checkoutAttemptId: checkout.attemptId },
        include: orderInclude,
      });
      if (!existing) {
        return { success: false, error: "Failed to create order. Please try again." };
      }
      created = false;
      order = existing;
    }

    const paymentMethod = order.payments[0]?.method;
    if (paymentMethod && paymentMethod !== checkout.paymentMethod) {
      return {
        success: false,
        error: "This checkout was already submitted. Refresh the page and try again.",
      };
    }

    if (
      checkout.paymentMethod === "razorpay" &&
      !order.inventoryHeld &&
      order.status === "pending"
    ) {
      try {
        await prisma.$transaction(async (tx) => {
          const claimed = await tx.order.updateMany({
            where: { id: order.id, inventoryHeld: false, status: "pending" },
            data: { inventoryHeld: true },
          });
          if (claimed.count !== 1) return;
          await reserveInventory(
            tx,
            order.items
              .filter((item) => item.variantId)
              .map((item) => ({
                variantId: item.variantId as string,
                quantity: item.quantity,
                name: item.name,
              })),
          );
        }, TX_OPTIONS);
        order = { ...order, inventoryHeld: true };
      } catch (error) {
        if (error instanceof InsufficientStockError) {
          return { success: false, error: error.message };
        }
        throw error;
      }
    }

    if (checkout.paymentMethod === "cod") {
      if (created) {
        await notifyPlacedOrder({
          ...order,
          paymentNote:
            "Payment method: Cash on Delivery. Please keep the amount ready at delivery.",
        });
      }
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentMethod: "cod",
      };
    }

    if (order.razorpayOrderId) {
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentMethod: "razorpay",
        razorpayOrderId: order.razorpayOrderId,
      };
    }

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amount: Math.round(order.total * 100),
        currency: "INR",
        receipt: order.orderNumber,
        notes: { orderId: order.id, orderNumber: order.orderNumber },
      });
    } catch {
      // The order row already exists so a retry reuses it instead of duplicating.
      return {
        success: false,
        error:
          "Online payment is unavailable right now. Your order is saved as unpaid — please try again.",
      };
    }

    const attached = await prisma.order.updateMany({
      where: { id: order.id, razorpayOrderId: null },
      data: { razorpayOrderId: razorpayOrder.id },
    });
    await prisma.payment.updateMany({
      where: { orderId: order.id, razorpayOrderId: null },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    if (attached.count === 0) {
      const current = await prisma.order.findUnique({ where: { id: order.id } });
      if (!current?.razorpayOrderId) {
        return { success: false, error: "Failed to create order. Please try again." };
      }
      return {
        success: true,
        orderId: current.id,
        orderNumber: current.orderNumber,
        amount: current.total,
        paymentMethod: "razorpay",
        razorpayOrderId: current.razorpayOrderId,
      };
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod: "razorpay",
      razorpayOrderId: razorpayOrder.id,
    };
  } catch {
    return { success: false, error: "Failed to create order. Please try again." };
  }
}
