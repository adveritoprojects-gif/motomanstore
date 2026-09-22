import { Suspense } from "react";
import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getProducts, getCategories } from "@/lib/queries";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our complete range of premium car care products. From shampoos to waxes, find everything you need for a showroom finish.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop | MOTOMAN",
    description:
      "Browse our complete range of premium car care products. From shampoos to waxes, find everything you need for a showroom finish.",
    type: "website",
    siteName: "MOTOMAN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | MOTOMAN",
    description:
      "Browse our complete range of premium car care products.",
  },
};

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;

  let products = null;
  let categories = null;
  let total = 0;
  let totalPages = 0;

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      getProducts({
        search: params.q,
        category: params.category,
        sort: (params.sort as "price-asc" | "price-desc" | "newest" | "name") || "newest",
        page,
        limit,
      }),
      getCategories(),
    ]);

    products = productsResult.products;
    total = productsResult.total;
    totalPages = productsResult.totalPages;
    categories = categoriesResult;
  } catch {
    // Database not available
  }

  return (
    <Container size="xl" className="py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <Typography variant="overline" className="mb-2 text-orange-500">
          Our Products
        </Typography>
        <Typography variant="h1" className="mb-2">
          Shop
        </Typography>
        <Typography variant="body" className="text-neutral-500">
          {total > 0
            ? `${total} product${total !== 1 ? "s" : ""} available`
            : "Professional car care products for every need."}
        </Typography>
      </div>

      <Suspense fallback={<div className="text-neutral-500">Loading products...</div>}>
        <ShopContent
          products={products ?? []}
          categories={categories ?? []}
          total={total}
          totalPages={totalPages}
          currentPage={page}
          currentSearch={params.q}
          currentCategory={params.category}
          currentSort={params.sort}
        />
      </Suspense>
    </Container>
  );
}
