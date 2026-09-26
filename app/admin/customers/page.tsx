"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getCustomers } from "@/lib/actions/admin-customers";
import {
  AdminDataTable,
  AdminPagination,
  AdminListSkeleton,
} from "@/components/admin";

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
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Customers</h1>
        <p className="text-sm text-neutral-500">
          {total} customer{total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Search */}
      <div className="sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 -mx-4 mb-4 bg-neutral-50/95 px-4 pb-2 pt-1 backdrop-blur md:-mx-6 md:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-0">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-h-11 w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-base outline-none transition-colors focus:border-orange-500 md:py-2 md:text-sm"
          />
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={5} />
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={customers as any}
            emptyMessage="No customers found"
            renderMobile={(item: Customer) => (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base font-bold text-orange-600">
                    {(item.name?.[0] || item.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">
                      {item.name || "No name"}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {item.email}
                    </p>
                    {item.phone && (
                      <p className="truncate text-xs text-neutral-400">
                        {item.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {item.orderCount}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                      Orders
                    </p>
                  </div>
                  <div className="border-x border-neutral-100">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {formatPrice(item.totalSpent)}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                      Spent
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                      Joined
                    </p>
                  </div>
                </div>
              </>
            )}
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
