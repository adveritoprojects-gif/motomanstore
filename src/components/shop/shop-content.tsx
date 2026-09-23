"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";

// Unified types
interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  isNew?: boolean;
  featured?: boolean;
  category?: { name: string; slug: string } | null;
}

interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ShopContentProps {
  products: ShopProduct[];
  categories: ShopCategory[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch?: string;
  currentCategory?: string;
  currentSort?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export function ShopContent({
  products,
  categories,
  total,
  totalPages,
  currentPage,
  currentSearch,
  currentCategory,
  currentSort = "newest",
}: ShopContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentSearch || "");

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page when filters change
    params.delete("page");

    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("q", searchInput.trim() || null);
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  }

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 gap-2" role="search">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <Input
              id="shop-search"
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateParams("q", null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
          <select
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <h2 className="mb-3 text-sm font-semibold text-neutral-950">
            Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams("category", null)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  !currentCategory
                    ? "bg-orange-50 font-medium text-orange-600"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                All Products
                <span className="ml-2 text-xs text-neutral-400">
                  ({total})
                </span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateParams("category", cat.slug)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    currentCategory === cat.slug
                      ? "bg-orange-50 font-medium text-orange-600"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  {cat.name}
                  {cat._count && (
                    <span className="ml-2 text-xs text-neutral-400">
                      ({cat._count.products})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-neutral-100 p-4">
                <Search className="h-8 w-8 text-neutral-400" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-neutral-900">
                No products found
              </h2>
              <p className="text-sm text-neutral-500">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
                  isPending && "opacity-60 pointer-events-none"
                )}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
