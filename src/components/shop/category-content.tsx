"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

interface CategoryProduct {
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

interface CategoryContentProps {
  products: CategoryProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSort?: string;
  categorySlug: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export function CategoryContent({
  products,
  totalPages,
  currentPage,
  currentSort = "newest",
  categorySlug,
}: CategoryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    startTransition(() => {
      router.push(`/categories/${categorySlug}?${params.toString()}`);
    });
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`/categories/${categorySlug}?${params.toString()}`);
    });
  }

  return (
    <div>
      {/* Sort Bar */}
      <div className="mb-6 flex items-center justify-end border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
          <select
            value={currentSort}
            onChange={(e) => updateSort(e.target.value)}
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

      {/* Products */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            No products in this category
          </h3>
          <p className="text-sm text-neutral-500">
            Check back later for new products.
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
  );
}
