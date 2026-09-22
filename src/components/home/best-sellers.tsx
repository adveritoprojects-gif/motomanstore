import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";

// Unified product type for the card
interface BestSellerProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string | null }[] | string[];
  isNew?: boolean;
  featured?: boolean;
  category?: { name: string; slug: string } | string;
  badge?: string;
}

interface BestSellersProps {
  products?: BestSellerProduct[];
}

export function BestSellers({ products: propProducts }: BestSellersProps) {
  const products: BestSellerProduct[] =
    propProducts && propProducts.length > 0
      ? propProducts
      : PRODUCTS.map((p) => ({
          ...p,
          images: [p.image],
          compareAtPrice: p.compareAtPrice ?? null,
        }));

  return (
    <section className="bg-neutral-50 py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
              Best Sellers
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Customer favourites for a cleaner, shinier drive.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
