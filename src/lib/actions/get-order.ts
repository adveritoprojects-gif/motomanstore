"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type OrderWithItems = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Record<string, string>;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  notes: string | null;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
};

export async function getOrder(
  orderId: string
): Promise<OrderWithItems | null> {
  try {
    const session = await getSession();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return null;

    if (session?.role !== "admin" && order.customerEmail !== session?.email) {
      return null;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingAddress: order.shippingAddress as Record<string, string>,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    };
  } catch {
    return null;
  }
}
