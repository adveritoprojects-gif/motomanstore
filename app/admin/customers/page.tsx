"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getCustomers } from "@/lib/actions/admin-customers";
import { AdminDataTable, AdminPagination } from "@/components/admin";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const result = await getCustomers({
          page,
          limit: 20,
          search: search || undefined,
        });
        if (!cancelled) {
          setCustomers(result.customers as Customer[]);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch {
        // Failed to load customers
      }
      if (!cancelled) setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [page, search]);

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            {(item.name?.[0] || item.email[0]).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              {item.name || "No name"}
            </p>
            <p className="text-xs text-neutral-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (item: Customer) => item.phone || "-",
    },
    {
      key: "orderCount",
      label: "Orders",
      render: (item: Customer) => (
        <span className="font-medium">{item.orderCount}</span>
      ),
    },
    {
      key: "totalSpent",
      label: "Total Spent",
      render: (item: Customer) => (
        <span className="font-semibold">{formatPrice(item.totalSpent)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item: Customer) => (
        <span className="text-neutral-500">
          {new Date(item.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Customers</h1>
        <p className="text-sm text-neutral-500">
          {total} customer{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange-500"
          />
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
            data={customers as any}
            emptyMessage="No customers found"
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
