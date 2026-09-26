"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/actions/admin-products";
import {
  AdminDataTable,
  AdminPagination,
  AdminListSkeleton,
  StatusBadge,
} from "@/components/admin";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
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

  const totalStock = (item: Product) =>
    item.variants.reduce((s, v) => s + v.stock, 0);

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
      render: (item: Product) => (
        <div>
          <span>{formatPrice(item.price)}</span>
          {item.compareAtPrice != null && item.compareAtPrice > item.price && (
            <span className="ml-2 text-xs text-neutral-400 line-through">
              {formatPrice(item.compareAtPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (item: Product) => {
        const stock = totalStock(item);
        return (
          <span className={stock <= 5 ? "font-semibold text-red-600" : ""}>
            {stock}
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

  const addProductButton = (
    <Link
      href="/admin/products/new"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
    >
      <Plus className="h-4 w-4" />
      Add Product
    </Link>
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Products</h1>
          <p className="text-sm text-neutral-500">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div>{addProductButton}</div>
      </div>

      {/* Search — sticky under the mobile header so it stays reachable */}
      <div className="sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-10 -mx-4 mb-4 bg-neutral-50/95 px-4 pb-2 pt-1 backdrop-blur md:-mx-6 md:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-0">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Search products..."
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
            data={products as any}
            onRowClick={(item) =>
              router.push(`/admin/products/${(item as Product).id}`)
            }
            emptyMessage="No products found"
            emptyAction={addProductButton}
            renderMobile={(item: Product) => {
              const stock = totalStock(item);
              return (
                <>
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
                      {item.images?.[0]?.url ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-neutral-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-400">
                        {item.sku}
                        {item.category?.name ? ` · ${item.category.name}` : ""}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.compareAtPrice != null &&
                          item.compareAtPrice > item.price && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(item.compareAtPrice)}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          stock === 0
                            ? "bg-red-100 text-red-700"
                            : stock <= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-700"
                        )}
                      >
                        {stock === 0 ? "Out of stock" : `Stock: ${stock}`}
                      </span>
                      <StatusBadge
                        status={item.featured ? "active" : "inactive"}
                        type="payment"
                      />
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-orange-600">
                      Edit
                    </span>
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
