"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getOrders } from "@/lib/actions/admin-orders";
import {
  AdminDataTable,
  AdminPagination,
  AdminListSkeleton,
  StatusBadge,
} from "@/components/admin";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items?: { quantity: number }[];
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const result = await getOrders({
          page,
          limit: 20,
          search: search || undefined,
          status: status !== "all" ? status : undefined,
        });
        if (!cancelled) {
          setOrders(result.orders as unknown as Order[]);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch {
        // Failed to load orders
      }
      if (!cancelled) setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [page, search, status]);

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      render: (item: Order) => (
        <div>
          <p className="font-medium text-neutral-900">{item.orderNumber}</p>
          <p className="text-xs text-neutral-400">
            {new Date(item.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (item: Order) => (
        <div>
          <p className="text-neutral-900">{item.customerName}</p>
          <p className="text-xs text-neutral-400">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Amount",
      render: (item: Order) => (
        <span className="font-semibold">{formatPrice(item.total)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Order) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Orders</h1>
        <p className="text-sm text-neutral-500">
          {total} order{total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Search + status filters */}
      <div className="sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 -mx-4 mb-4 bg-neutral-50/95 px-4 pb-2 pt-1 backdrop-blur md:-mx-6 md:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-0">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-h-11 w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-base outline-none transition-colors focus:border-orange-500 md:py-2 md:text-sm"
          />
        </div>
        <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:px-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-orange-500 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={5} />
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={orders as any}
            onRowClick={(item) =>
              router.push(`/admin/orders/${(item as Order).id}`)
            }
            emptyMessage="No orders found"
            renderMobile={(item: Order) => {
              const itemCount =
                item.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;
              return (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-900">
                        {item.orderNumber}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-neutral-700">
                        {item.customerName}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {item.customerEmail}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                    <div className="min-w-0 text-xs text-neutral-500">
                      <p>
                        {itemCount > 0
                          ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
                          : "Order"}
                      </p>
                      <p className="mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-base font-bold text-neutral-900">
                        {formatPrice(item.total)}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </>
              );
            }}
          />
          <div className="mt-4">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
