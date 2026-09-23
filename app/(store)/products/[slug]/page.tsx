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

    const title = productSeoTitle(product);
    const description = productSeoDescription(product);
    const imageUrl = absoluteImage(product.images[0]?.url);
    const canonicalPath = `/products/${product.slug}`;

    return {
      // productSeoTitle already leads with the brand — use an absolute title
      // so the layout template doesn't produce "… | MOTOMAN | MOTOMAN".
      title: { absolute: title },
      description,
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

  let product = null;
  let relatedProducts = null;

  try {
    product = await getProductBySlug(slug);
    if (!product) {
      notFound();
    }

    relatedProducts = await getRelatedProducts(
      product.id,
      product.category.slug,
      4
    );
  } catch {
    notFound();
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
