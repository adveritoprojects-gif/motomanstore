import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMBO_PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";

// Unified product type for the card
interface ComboOfferProduct {
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
  tags?: string[];
  variants?: { name: string; size?: string | null; stock?: number }[];
}

interface ComboOffersProps {
  products?: ComboOfferProduct[];
}

export function ComboOffers({ products: propProducts }: ComboOffersProps) {
  const products: ComboOfferProduct[] =
    propProducts && propProducts.length > 0
      ? propProducts
      : COMBO_PRODUCTS.map((p) => ({
          ...p,
          images: [p.image],
          compareAtPrice: p.compareAtPrice ?? null,
        }));

  return (
    <section className="bg-neutral-50 py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
              Combo Offers
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Washing kits with the products you need in one pack.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
