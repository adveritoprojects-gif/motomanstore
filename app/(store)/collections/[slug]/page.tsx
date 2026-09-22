import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCollectionBySlug } from "@/lib/queries";
import { ProductGrid } from "@/components/product/product-grid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await getCollectionBySlug(slug);
    if (!collection) {
      return { title: "Collection Not Found" };
    }
    return {
      title: collection.name,
      description:
        collection.description ||
        `${collection.name} collection at MOTOMAN Premium Car Care.`,
      alternates: {
        canonical: `/collections/${collection.slug}`,
      },
      openGraph: {
        title: `${collection.name} | MOTOMAN`,
        description:
          collection.description ||
          `${collection.name} collection at MOTOMAN Premium Car Care.`,
        type: "website",
        siteName: "MOTOMAN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${collection.name} | MOTOMAN`,
        description:
          collection.description ||
          `${collection.name} collection at MOTOMAN Premium Car Care.`,
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

  return (
    <Container size="xl" className="py-8 md:py-12">
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

      {/* Products */}
      {collection!.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            No products in this collection
          </h3>
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
