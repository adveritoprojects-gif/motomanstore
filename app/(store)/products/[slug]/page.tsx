import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";


interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: "Product Not Found" };
    }

    const imageUrl =
      product.images[0]?.url || "/placeholder-product.jpg";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in";

    return {
      title: product.name,
      description: product.description.slice(0, 160),
      alternates: {
        canonical: `/products/${product.slug}`,
      },
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 200),
        type: "website",
        siteName: "MOTOMAN",
        url: `${baseUrl}/products/${product.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description.slice(0, 200),
        images: [imageUrl],
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    category: product.category.name,
    image: product.images[0]?.url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
