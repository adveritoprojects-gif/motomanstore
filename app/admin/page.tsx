export const dynamic = "force-dynamic";

import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getDashboardStats } from "@/lib/actions/admin-dashboard";
import { StatCard, StatusBadge } from "@/components/admin";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Welcome back. Here&apos;s your store overview.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 lg:mb-6 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={formatPrice(stats.todaySales)}
          change={`${stats.todayOrders} order${stats.todayOrders === 1 ? "" : "s"} today`}
          changeType={stats.todayOrders > 0 ? "positive" : "neutral"}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Sales"
          value={formatPrice(stats.totalSales)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          change={`${stats.todayOrders} today`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 lg:mb-8 lg:grid-cols-2">
        <StatCard
          label="Products"
          value={stats.totalProducts}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats.lowStockProducts.length}
          change={stats.lowStockProducts.length > 0 ? "Needs attention" : "All good"}
          changeType={stats.lowStockProducts.length > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-950">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-orange-500 hover:text-orange-600"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {stats.recentOrders.length === 0 && (
              <p className="p-5 text-sm text-neutral-500">No orders yet.</p>
            )}
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-neutral-50"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatPrice(order.total)}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-950">Top Products</h2>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-orange-500 hover:text-orange-600"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {stats.topProducts.length === 0 && (
              <p className="p-5 text-sm text-neutral-500">
                No product data yet.
              </p>
            )}
            {stats.topProducts.map((product, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {product.orderCount} orders
                  </p>
                </div>
                <p className="text-sm font-semibold text-neutral-700">
                  {product.totalSold} sold
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        {stats.lowStockProducts.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-red-200 px-5 py-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h2 className="font-semibold text-red-900">Low Stock Alerts</h2>
            </div>
            <div className="divide-y divide-red-200/50">
              {stats.lowStockProducts.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-red-600">
                      Variant: {item.variantName}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-700">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 lg:mt-6">
        <h2 className="mb-3 font-semibold text-neutral-950">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/products/new"
            className="flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="flex min-h-12 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            View Orders
          </Link>
          <Link
            href="/admin/products"
            className="flex min-h-12 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            <Package className="h-4 w-4 shrink-0" />
            Manage Products
          </Link>
          <Link
            href="/admin/customers"
            className="flex min-h-12 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            <Users className="h-4 w-4 shrink-0" />
            View Customers
          </Link>
        </div>
      </div>
    </div>
  );
}
