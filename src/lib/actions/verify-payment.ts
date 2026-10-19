"use server";

import { after } from "next/server";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { getRazorpayInstance, verifyRazorpaySignature } from "@/lib/razorpay";
import { scheduleAndDeliverNow } from "@/lib/notifications";
import { paymentAmountMatches, paymentCurrencyMatches } from "@/lib/checkout/price-cart";
import { InsufficientStockError, reserveInventory } from "@/lib/checkout/inventory";
import type { RazorpayVerificationParams } from "@/types/razorpay";

export type VerifyPaymentResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function verifyPayment(
  params: RazorpayVerificationParams
): Promise<VerifyPaymentResult> {
  try {
    const isValid = verifyRazorpaySignature(params);

    if (!isValid) {
      return { success: false, error: "Invalid payment signature" };
    }

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: params.razorpay_order_id },
      include: { items: true, payments: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
      return { success: true, orderId: order.id };
    }

    if (order.status === "cancelled" || order.status === "refunded") {
      return { success: false, error: "This order can no longer be paid" };
    }

    const remote = await getRazorpayInstance().payments.fetch(params.razorpay_payment_id);
    if (remote.order_id !== params.razorpay_order_id) {
      return { success: false, error: "Payment does not match this order" };
    }
    if (!paymentCurrencyMatches(remote.currency) || !paymentAmountMatches(order.total, remote.amount)) {
      return { success: false, error: "Payment amount does not match the order" };
    }
    if (remote.status !== "captured") {
      return { success: false, error: "Payment has not been captured" };
    }

    if (!order.inventoryHeld) {
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
      } catch (error) {
        if (error instanceof InsufficientStockError) {
          return { success: false, error: error.message };
        }
        throw error;
      }
    }

    const marked = await prisma.order.updateMany({
      where: { id: order.id, status: "pending" },
      data: { status: "paid" },
    });
    if (marked.count !== 1) {
      const current = await prisma.order.findUnique({ where: { id: order.id } });
      if (
        current &&
        ["paid", "processing", "shipped", "delivered"].includes(current.status)
      ) {
        return { success: true, orderId: order.id };
      }
      return { success: false, error: "This order can no longer be paid" };
    }

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: { in: ["pending", "failed"] } },
      data: {
        razorpayPaymentId: params.razorpay_payment_id,
        razorpaySignature: params.razorpay_signature,
        status: "success",
        method: remote.method,
      },
    });

    // Signature + remote amount/status were verified above; only the winner
    // of the pending→paid transition schedules PAYMENT_SUCCEEDED, so a
    // concurrent webhook retry cannot produce duplicate emails (outbox key).
    after(async () => {
      await scheduleAndDeliverNow({
        eventType: "PAYMENT_SUCCEEDED",
        orderId: order.id,
        recipientRole: "customer",
      });
      await scheduleAndDeliverNow({
        eventType: "PAYMENT_SUCCEEDED",
        orderId: order.id,
        recipientRole: "admin",
      });
    });

    return { success: true, orderId: order.id };
  } catch {
    return {
      success: false,
      error: "Payment verification failed. Please contact support.",
    };
  }
}
