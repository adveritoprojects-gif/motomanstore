"use server";

import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkoutSchema, cartSchema } from "@/lib/validations";
import type { CheckoutFormData, CartItemInput } from "@/lib/validations";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

function generateOrderNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MT-${datePart}-${randomPart}`;
}

export type CreateOrderResult =
  | { success: true; orderId: string; razorpayOrderId: string; amount: number }
  | { success: false; error: string };

export async function createOrder(
  checkoutData: CheckoutFormData,
  cartItems: CartItemInput[]
): Promise<CreateOrderResult> {
  try {
    const validatedCheckout = checkoutSchema.safeParse(checkoutData);
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

    const productIds = cartItems.map((item) => item.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true, variants: true },
    });

    if (dbProducts.length === 0) {
      return { success: false, error: "No valid products found in cart" };
    }

    const orderItems: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }[] = [];

    let subtotal = 0;

    for (const cartItem of cartItems) {
      const dbProduct = dbProducts.find((p) => p.id === cartItem.id);

      if (!dbProduct) {
        return {
          success: false,
          error: `Product "${cartItem.name}" is no longer available`,
        };
      }

      if (!dbProduct.inStock) {
        return {
          success: false,
          error: `"${dbProduct.name}" is currently out of stock`,
        };
      }

      let itemPrice = dbProduct.price;
      let itemName = dbProduct.name;
      const itemImage = dbProduct.images[0]?.url || "/placeholder-product.jpg";

      if (cartItem.variantId) {
        const variant = dbProduct.variants.find(
          (v) => v.id === cartItem.variantId
        );

        if (!variant) {
          return {
            success: false,
            error: `Variant for "${dbProduct.name}" is no longer available`,
          };
        }

        if (variant.stock < cartItem.quantity) {
          return {
            success: false,
            error: `Only ${variant.stock} units of "${dbProduct.name} - ${variant.name}" are available`,
          };
        }

        itemPrice = variant.price ?? dbProduct.price;
        itemName = `${dbProduct.name} - ${variant.name}`;
      }

      subtotal += itemPrice * cartItem.quantity;

      orderItems.push({
        productId: dbProduct.id,
        name: itemName,
        price: itemPrice,
        quantity: cartItem.quantity,
        image: itemImage,
      });
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "pending",
        subtotal,
        shippingCost,
        total,
        shippingAddress: validatedCheckout.data,
        customerEmail: validatedCheckout.data.email,
        customerName: `${validatedCheckout.data.firstName} ${validatedCheckout.data.lastName}`,
        customerPhone: validatedCheckout.data.phone,
        notes: validatedCheckout.data.notes,
        items: { create: orderItems },
        payments: {
          create: { amount: total, currency: "INR", status: "pending" },
        },
      },
    });

    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: { orderId: order.id, orderNumber },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: "pending" },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
    };
  } catch {
    return { success: false, error: "Failed to create order. Please try again." };
  }
}
