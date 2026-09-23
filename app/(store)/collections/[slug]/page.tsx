import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCollectionBySlug } from "@/lib/queries";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { itemListJsonLd } from "@/lib/seo/json-ld";
import { truncate } from "@/lib/seo/metadata";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await getCollectionBySlug(slug);
    if (!collection) {
      return { title: "Collection Not Found", robots: { index: false } };
    }
    const title = `${collection.name} Collection`;
    const description = collection.description
      ? truncate(
          `Shop the ${collection.name} collection at MOTOMAN — ${collection.description}.`,
          155
        )
      : `Shop the ${collection.name} collection at MOTOMAN Premium Car Care.`;
    return {
      title,
      description,
      alternates: {
        canonical: `/collections/${collection.slug}`,
      },
      openGraph: {
        title: `${title} | MOTOMAN`,
        description,
        type: "website",
        siteName: "MOTOMAN",
        url: `/collections/${collection.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | MOTOMAN`,
        description,
      },
    };
  } catch {
    return { title: "Collection" };
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  let collection = null;

  try {
    collection = await getCollectionBySlug(slug);
    if (!collection) {
      notFound();
    }
  } catch {
    notFound();
  }

  const itemList =
    collection!.products.length > 0
      ? itemListJsonLd({
          name: `${collection!.name} collection`,
          items: collection!.products.map((p) => ({
            name: p.name,
            slug: p.slug,
          })),
        })
      : null;

  return (
    <Container size="xl" className="py-8 md:py-12">
      <Breadcrumbs
        items={[
          { name: "Collections", item: "/collections" },
          { name: collection!.name, item: `/collections/${collection!.slug}` },
        ]}
      />
      {itemList && <JsonLd data={itemList} />}

      {/* Collection Header */}
      <div className="mb-8">
        <Typography variant="overline" className="mb-2 text-orange-500">
          Collection
        </Typography>
        <Typography variant="h1" className="mb-2">
          {collection!.name}
        </Typography>
        {collection!.description && (
          <Typography variant="body" className="text-neutral-500">
            {collection!.description}
          </Typography>
        )}
        <Typography variant="body-sm" className="mt-2 text-neutral-400">
          {collection!._count.products} product
          {collection!._count.products !== 1 ? "s" : ""}
        </Typography>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-neutral-950">
        Shop the {collection!.name} Collection
      </h2>

      {/* Products */}
      {collection!.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-2 text-lg font-semibold text-neutral-900">
            No products in this collection
          </p>
          <p className="text-sm text-neutral-500">
            Check back later for new additions.
          </p>
        </div>
      ) : (
        <ProductGrid products={collection!.products} />
      )}
    </Container>
  );
}
