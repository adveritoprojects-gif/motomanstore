"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getOrders } from "@/lib/actions/admin-orders";
import { AdminDataTable, AdminPagination, StatusBadge } from "@/components/admin";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Orders</h1>
        <p className="text-sm text-neutral-500">
          {total} order{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange-500"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-orange-500 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
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
