"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { releaseHeldInventory } from "@/lib/checkout/inventory";
import {
  getDefaultNotificationDeps,
  retryNotification,
  scheduleAndDeliverNow,
  transitionEvent,
} from "@/lib/notifications";

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 1)}***${domain}`;
}

export async function getOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { status, search, page = 1, limit = 20 } = params ?? {};

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      ...o,
      shippingAddress: o.shippingAddress as Record<string, string>,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrderById(id: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      emailNotifications: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return null;

  const { emailNotifications, ...rest } = order;
  return {
    ...rest,
    shippingAddress: order.shippingAddress as Record<string, string>,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    notifications: emailNotifications.map((n) => ({
      id: n.id,
      eventType: n.eventType,
      recipientRole: n.recipientRole,
      recipientMasked: maskEmail(n.recipient),
      subject: n.subject,
      status: n.status,
      attempts: n.attempts,
      lastError: n.lastError,
      lastAttemptAt: n.updatedAt.toISOString(),
      sentAt: n.sentAt ? n.sentAt.toISOString() : null,
    })),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  await requireAdmin();

  const validStatuses = [
    "pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const result = await prisma.$transaction(async (tx) => {
    const previous = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!previous) throw new Error("Order not found");

    if (status === "cancelled" || status === "refunded") {
      await releaseHeldInventory(tx, orderId);
    }
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
    return { previousStatus: previous.status, order };
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  // Email only on a real persisted transition (shipped/delivered/cancelled).
  // Re-selecting the same status schedules nothing. A manual "refunded"
  // status change is NOT proof of a provider refund, so no refund email.
  const event = transitionEvent(result.previousStatus, status);
  if (event) {
    const scheduledOrderId = orderId;
    after(async () => {
      await scheduleAndDeliverNow({
        eventType: event,
        orderId: scheduledOrderId,
        recipientRole: "customer",
      });
    });
  }

  return result.order;
}

/**
 * Retries a failed email notification. Admin-only; safe because the outbox
 * never re-sends a `sent` row and terminal failures require this explicit
 * requeue.
 */
export async function retryOrderEmailNotification(notificationId: string) {
  await requireAdmin();

  const result = await retryNotification(
    getDefaultNotificationDeps(),
    notificationId
  );

  revalidatePath("/admin/orders");
  return result;
}
