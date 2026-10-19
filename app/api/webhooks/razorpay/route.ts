import { NextRequest, NextResponse, after } from "next/server";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { scheduleAndDeliverNow } from "@/lib/notifications";
import {
  captureDecision,
  paymentAmountMatches,
  paymentCurrencyMatches,
} from "@/lib/checkout/price-cart";
import { InsufficientStockError, releaseHeldInventory, reserveInventory } from "@/lib/checkout/inventory";

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
        if (payment.order_id !== order.razorpayOrderId) break;

        const decision = captureDecision(
          order.status,
          paymentAmountMatches(order.total, Number(payment.amount)),
          paymentCurrencyMatches(payment.currency),
        );
        if (decision !== "capture") break;

        let markedPaid = false;
        try {
          markedPaid = await prisma.$transaction(async (tx) => {
            const current = await tx.order.findUnique({
              where: { id: order.id },
              include: { items: true },
            });
            if (!current || current.status !== "pending") return false;
            if (
              !paymentAmountMatches(current.total, Number(payment.amount)) ||
              !paymentCurrencyMatches(payment.currency)
            ) {
              return false;
            }

            if (!current.inventoryHeld) {
              const claimed = await tx.order.updateMany({
                where: { id: current.id, inventoryHeld: false, status: "pending" },
                data: { inventoryHeld: true },
              });
              if (claimed.count !== 1) return false;
              await reserveInventory(
                tx,
                current.items
                  .filter((item) => item.variantId)
                  .map((item) => ({
                    variantId: item.variantId as string,
                    quantity: item.quantity,
                    name: item.name,
                  })),
              );
            }

            const paid = await tx.order.updateMany({
              where: { id: current.id, status: "pending" },
              data: { status: "paid" },
            });
            if (paid.count !== 1) return false;

            await tx.payment.updateMany({
              where: { orderId: current.id, status: { in: ["pending", "failed"] } },
              data: {
                razorpayPaymentId: paymentId,
                status: "success",
                method: payment.method,
                metadata: {
                  fee: payment.fee,
                  tax: payment.tax,
                  currency: payment.currency,
                },
              },
            });
            return true;
          }, TX_OPTIONS);
        } catch (error) {
          if (error instanceof InsufficientStockError) break;
          throw error;
        }

        if (!markedPaid) break;

        // Only the transaction that flipped pending→paid schedules the
        // notification; the outbox event key makes webhook retries no-ops.
        const paidOrderId = order.id;
        after(async () => {
          await scheduleAndDeliverNow({
            eventType: "PAYMENT_SUCCEEDED",
            orderId: paidOrderId,
            recipientRole: "customer",
          });
          await scheduleAndDeliverNow({
            eventType: "PAYMENT_SUCCEEDED",
            orderId: paidOrderId,
            recipientRole: "admin",
          });
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

        // A failure event is only meaningful while the order is still
        // awaiting payment — never for orders that were later captured.
        const stillPending = order.status === "pending";

        await prisma.$transaction(async (tx) => {
          const current = await tx.order.findUnique({ where: { id: order.id } });
          if (!current || current.status !== "pending") return;

          await tx.payment.updateMany({
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
          await releaseHeldInventory(tx, order.id, { onlyStatus: "pending" });
        }, TX_OPTIONS);

        if (stillPending) {
          const failedOrderId = order.id;
          after(async () => {
            await scheduleAndDeliverNow({
              eventType: "PAYMENT_FAILED",
              orderId: failedOrderId,
              recipientRole: "customer",
            });
          });
        }

        break;
      }

      case "refund.created": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: payment.order_id },
        });

        if (!order || order.status === "refunded") break;

        // Persist the provider's refund reference/amount (paise → rupees)
        // so the customer email can quote the real refunded figure.
        const refundEntity = event.payload.refund?.entity;
        const refundId =
          typeof refundEntity?.id === "string" ? refundEntity.id : null;
        const refundAmount =
          typeof refundEntity?.amount === "number"
            ? refundEntity.amount / 100
            : null;

        await prisma.$transaction(async (tx) => {
          await releaseHeldInventory(tx, order.id);
          await tx.payment.updateMany({
            where: { orderId: order.id, status: { not: "refunded" } },
            data: {
              status: "refunded",
              metadata: refundId || refundAmount !== null
                ? { refund_id: refundId, refund_amount: refundAmount }
                : undefined,
            },
          });
          await tx.order.updateMany({
            where: { id: order.id, status: { not: "refunded" } },
            data: { status: "refunded" },
          });
        }, TX_OPTIONS);

        const refundedOrderId = order.id;
        after(async () => {
          await scheduleAndDeliverNow({
            eventType: "REFUND_PROCESSED",
            orderId: refundedOrderId,
            recipientRole: "customer",
          });
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
