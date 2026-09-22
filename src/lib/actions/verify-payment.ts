"use server";

import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
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

    if (order.status === "paid") {
      return { success: true, orderId: order.id };
    }

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: "pending" },
      data: {
        razorpayPaymentId: params.razorpay_payment_id,
        razorpaySignature: params.razorpay_signature,
        status: "success",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });

    const shippingAddress = order.shippingAddress as Record<string, string>;
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingAddress: {
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2,
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "India",
      },
    });

    return { success: true, orderId: order.id };
  } catch {
    return {
      success: false,
      error: "Payment verification failed. Please contact support.",
    };
  }
}
