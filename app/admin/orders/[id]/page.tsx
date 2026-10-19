"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  Mail,
  Package,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  getOrderById,
  retryOrderEmailNotification,
  updateOrderStatus,
} from "@/lib/actions/admin-orders";
import { StatusBadge } from "@/components/admin";

type OrderNotification = {
  id: string;
  eventType: string;
  recipientRole: string;
  recipientMasked: string;
  subject: string;
  status: string;
  attempts: number;
  lastError: string | null;
  lastAttemptAt: string;
  sentAt: string | null;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  codFee: number;
  total: number;
  shippingAddress: Record<string, string>;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  notes: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  payments: {
    id: string;
    amount: number;
    status: string;
    method: string | null;
    createdAt: string;
  }[];
  notifications?: OrderNotification[];
};

const STATUSES = [
  "pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function refresh() {
    const data = await getOrderById(params.id as string);
    setOrder(data as unknown as OrderDetail);
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data = await getOrderById(params.id as string);
        if (!cancelled) setOrder(data as unknown as OrderDetail);
      } catch {
        // Failed to load order
      }
      if (!cancelled) setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [params.id]);

  async function handleStatusChange(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      await refresh();
    } catch {
      // Failed to update status
    }
    setUpdating(false);
  }

  async function handleRetry(notificationId: string) {
    setRetryingId(notificationId);
    try {
      await retryOrderEmailNotification(notificationId);
      await refresh();
    } catch {
      // Failed to retry
    }
    setRetryingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-white" />
        <div className="h-48 animate-pulse rounded-xl border border-neutral-200 bg-white" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm text-neutral-500">Order not found.</p>
      </div>
    );
  }

  const address = order.shippingAddress;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      {/* Order header + status controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-neutral-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <div className="flex flex-1 items-center gap-2 sm:flex-none">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              aria-label="Order status"
              className="min-h-11 w-full flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none focus:border-orange-500 disabled:opacity-50 sm:w-auto sm:text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updating && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
          </div>
        </div>
      </div>

      {/* Mobile: customer/address first, then items & payment.
          Desktop: two-column grid with items on the left. */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Sidebar sections */}
        <div className="space-y-4 lg:col-start-3 lg:row-start-1 lg:space-y-6">
          {/* Customer */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 font-semibold text-neutral-950">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-neutral-900">{order.customerName}</p>
              <p className="break-all text-neutral-500">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-neutral-500">{order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-950">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-neutral-600">
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="mb-2 font-semibold text-neutral-950">Notes</h2>
              <p className="text-sm text-neutral-600">{order.notes}</p>
            </div>
          )}

          {/* Email notifications (outbox) */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-950">
              <Mail className="h-4 w-4" />
              Email notifications
            </h2>
            {!order.notifications || order.notifications.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No notifications scheduled for this order yet.
              </p>
            ) : (
              <div className="space-y-3">
                {order.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-neutral-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {n.eventType.replace(/_/g, " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {n.recipientRole} · {n.recipientMasked}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          n.status === "sent"
                            ? "bg-green-50 text-green-700"
                            : n.status === "failed"
                              ? "bg-red-50 text-red-700"
                              : n.status === "processing"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {n.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Attempts: {n.attempts} · Last attempt:{" "}
                      {new Date(n.lastAttemptAt).toLocaleString("en-IN")}
                    </p>
                    {n.lastError && (
                      <p className="mt-1 break-words text-xs text-red-600">
                        {n.lastError}
                      </p>
                    )}
                    {n.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(n.id)}
                        disabled={retryingId !== null}
                        className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-orange-500 hover:text-orange-600 disabled:opacity-50"
                      >
                        {retryingId === n.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Retry
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items + payment */}
        <div className="space-y-4 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-950">
              <Package className="h-4 w-4" />
              Items
            </h2>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.image?.startsWith("/") ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Qty: {item.quantity} &times; {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-neutral-700">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>COD Handling Fee</span>
                  <span>{formatPrice(order.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-950">
              <CreditCard className="h-4 w-4" />
              Payment
            </h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-neutral-500">No payment records.</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 p-3"
                  >
                    <div className="min-w-0">
                      <StatusBadge status={p.status} type="payment" />
                      {p.method && (
                        <span className="ml-2 text-xs text-neutral-500">
                          {p.method === "cod"
                            ? "Cash on Delivery"
                            : p.method === "razorpay"
                              ? "Razorpay"
                              : p.method}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatPrice(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
