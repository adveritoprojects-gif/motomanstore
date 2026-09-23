import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { itemListJsonLd } from "@/lib/seo/json-ld";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryGrid } from "@/components/shop/category-grid";
import { getLandingPage } from "@/lib/seo/landing-pages";
import { getLandingProducts, getCategories } from "@/lib/queries";

interface LandingPageViewProps {
  /** Key into LANDING_PAGES, e.g. "microfiber-cloths" */
  pageKey: string;
}

/**
 * Shared server-rendered view for SEO landing pages.
 * Fetches products from real category/tag filters — no fake relationships.
 */
export async function LandingPageView({ pageKey }: LandingPageViewProps) {
  const page = getLandingPage(pageKey);
  if (!page) return null;

  let products: Awaited<ReturnType<typeof getLandingProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    const [productRows, categoryRows] = await Promise.all([
      getLandingProducts({
        categorySlugs: page.hub ? undefined : page.categorySlugs,
        tags: page.tags,
        limit: 48,
      }),
      page.hub ? getCategories() : Promise.resolve([]),
    ]);
    products = productRows;
    categories = categoryRows;
  } catch (error) {
    console.error(`Failed to load landing page ${pageKey}:`, error);
  }

  const breadcrumbs = [{ name: page.h1, item: page.path }];
  const itemList = itemListJsonLd({
    name: page.productsHeading,
    items: products.map((p) => ({ name: p.name, slug: p.slug })),
  });

  return (
    <Container size="xl" className="py-8 md:py-12">
      <Breadcrumbs items={breadcrumbs} />
      {products.length > 0 && <JsonLd data={itemList} />}

      <div className="mb-8">
        <Typography variant="overline" className="mb-2 text-orange-500">
          {page.overline}
        </Typography>
        <Typography variant="h1" className="mb-4">
          {page.h1}
        </Typography>
        <div className="max-w-3xl space-y-3">
          {page.intro.map((paragraph) => (
            <Typography key={paragraph.slice(0, 32)} variant="body" className="text-neutral-500">
              {paragraph}
            </Typography>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <nav aria-label="Related pages" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {page.related.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm text-neutral-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {page.hub && categories.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-bold text-neutral-950 sm:text-2xl">
            Shop by Category
          </h2>
          <CategoryGrid categories={categories} />
        </section>
      )}

      <section>
        <h2 className="mb-5 text-xl font-bold text-neutral-950 sm:text-2xl">
          {page.productsHeading}
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 py-16 text-center">
            <p className="mb-2 text-lg font-semibold text-neutral-900">
              Products coming soon
            </p>
            <p className="text-sm text-neutral-500">
              Browse the{" "}
              <Link href="/shop" className="text-orange-500 hover:text-orange-600">
                full shop
              </Link>{" "}
              while we restock this range.
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </Container>
  );
}
