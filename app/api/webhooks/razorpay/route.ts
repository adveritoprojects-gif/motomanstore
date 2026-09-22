import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const orderId = payment.order_id;
        const paymentId = payment.id;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: orderId },
          include: { items: true },
        });

        if (!order) break;

        // Idempotency: skip if already paid
        if (order.status === "paid") break;

        await prisma.payment.updateMany({
          where: { orderId: order.id, status: "pending" },
          data: {
            razorpayPaymentId: paymentId,
            status: "success",
            method: payment.method,
            metadata: {
              fee: payment.fee,
              tax: payment.tax,
            },
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

        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const orderId = payment.order_id;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (!order) break;

        await prisma.payment.updateMany({
          where: { orderId: order.id, status: "pending" },
          data: {
            razorpayPaymentId: payment.id,
            status: "failed",
            metadata: {
              error_description: payment.error_description,
              error_code: payment.error_code,
            },
          },
        });

        break;
      }

      case "refund.created": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: payment.order_id },
        });

        if (!order) break;

        await prisma.payment.updateMany({
          where: { orderId: order.id, razorpayPaymentId: payment.id },
          data: { status: "refunded" },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "refunded" },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
