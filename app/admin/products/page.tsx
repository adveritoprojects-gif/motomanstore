"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/actions/admin-products";
import { AdminDataTable, AdminPagination, StatusBadge } from "@/components/admin";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  category: { name: string };
  images: { url: string }[];
  variants: { stock: number }[];
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
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
        const result = await getProducts({ page, limit: 20, search: search || undefined });
        if (!cancelled) {
          setProducts(result.products as Product[]);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch {
        // Failed to load products
      }
      if (!cancelled) setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [page, search]);

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (item: Product) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
            <Package className="h-5 w-5 text-neutral-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{item.name}</p>
            <p className="text-xs text-neutral-400">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item: Product) => item.category?.name || "-",
    },
    {
      key: "price",
      label: "Price",
      render: (item: Product) => formatPrice(item.price),
    },
    {
      key: "stock",
      label: "Stock",
      render: (item: Product) => {
        const totalStock = item.variants.reduce((s, v) => s + v.stock, 0);
        return (
          <span className={totalStock <= 5 ? "font-semibold text-red-600" : ""}>
            {totalStock}
          </span>
        );
      },
    },
    {
      key: "featured",
      label: "Featured",
      render: (item: Product) => (
        <StatusBadge
          status={item.featured ? "active" : "inactive"}
          type="payment"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">Products</h1>
          <p className="text-sm text-neutral-500">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
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
            data={products as any}
            onRowClick={(item) =>
              router.push(`/admin/products/${(item as Product).id}`)
            }
            emptyMessage="No products found"
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
