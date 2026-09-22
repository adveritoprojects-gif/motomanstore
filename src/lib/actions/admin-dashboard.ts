"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalSales,
    todaySales,
    totalOrders,
    todayOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["paid", "processing", "shipped", "delivered"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ["paid", "processing", "shipped", "delivered"] },
        createdAt: { gte: todayStart },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.product.count(),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true, id: true } } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalSales: totalSales._sum.total || 0,
    todaySales: todaySales._sum.total || 0,
    totalOrders,
    todayOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts: lowStockProducts.map((v) => ({
      id: v.product.id,
      variantName: v.name,
      stock: v.stock,
      productName: v.product.name,
    })),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
    topProducts: topProducts.map((p) => ({
      name: p.name,
      totalSold: p._sum.quantity || 0,
      orderCount: p._count,
    })),
  };
}
