"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getCustomers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { search, page = 1, limit = 20 } = params ?? {};

  const where: Record<string, unknown> = {
    role: "customer",
  };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const customers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    orderCount: u._count.orders,
    totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
    recentOrders: u.orders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
    createdAt: u.createdAt.toISOString(),
  }));

  return {
    customers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
