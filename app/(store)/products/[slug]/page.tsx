import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import {
  productSeoTitle,
  productSeoDescription,
} from "@/lib/seo/metadata";
import { absoluteImage, SITE_NAME } from "@/lib/seo/site";

export const revalidate = 120;

async function getProductWithRetry(slug: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await getProductBySlug(slug);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      }
    }
  }
  throw lastError;
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: "Product Not Found", robots: { index: false } };
    }

    // Per-product SEO overrides win over the generated fallbacks.
    const title = product.metaTitle?.trim() || productSeoTitle(product);
    const description =
      product.metaDescription?.trim() || productSeoDescription(product);
    const imageUrl = absoluteImage(product.images[0]?.url);
    const canonicalPath = `/products/${product.slug}`;
    const keywords = product.tags.length > 0 ? product.tags : undefined;

    return {
      // productSeoTitle already leads with the brand — use an absolute title
      // so the layout template doesn't produce "… | MOTOMAN | MOTOMAN".
      title: { absolute: title },
      description,
      ...(keywords ? { keywords } : {}),
      alternates: { canonical: canonicalPath },
      openGraph: {
        type: "website",
        siteName: SITE_NAME,
        url: canonicalPath,
        title,
        description,
        ...(imageUrl
          ? { images: [{ url: imageUrl, alt: product.name }] }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Transient database errors must never be reported as a 404: only a
  // genuinely missing product may call notFound(). Retry briefly so a
  // dropped connection doesn't fail the page, then surface real errors.
  const product = await getProductWithRetry(slug);
  if (!product) {
    notFound();
  }

  // Related products are optional — never fail the page over them.
  let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    relatedProducts = await getRelatedProducts(
      product.id,
      product.category.slug,
      4
    );
  } catch {
    relatedProducts = [];
  }

  const jsonLd = productJsonLd({
    id: product.id,
    name: product.name,
    description: product.description,
    slug: product.slug,
    sku: product.sku,
    gtin: product.gtin,
    mpn: product.mpn,
    brand: product.brand,
    price: product.price,
    inStock: product.inStock,
    categoryName: product.category.name,
    images: product.images,
  });

  const breadcrumbJsonLdData = breadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Shop", item: "/shop" },
    { name: product.category.name, item: `/categories/${product.category.slug}` },
    { name: product.name, item: `/products/${product.slug}` },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLdData} />
      <Container size="xl" className="py-8 md:py-12">
        <ProductDetail product={product} />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-neutral-200 pt-12">
            <h2 className="mb-6 text-xl font-bold text-neutral-950">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </Container>
    </>
  );
}
