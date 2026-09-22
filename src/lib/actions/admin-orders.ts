"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
    include: { items: true, payments: true },
  });

  if (!order) return null;

  return {
    ...order,
    shippingAddress: order.shippingAddress as Record<string, string>,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
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

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return order;
}
