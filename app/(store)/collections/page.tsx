import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCollections } from "@/lib/queries";
import { CollectionsGrid } from "@/components/shop/collections-grid";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore our curated product collections. Starter kits, pro series, and essential car care bundles.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Collections | MOTOMAN",
    description: "Explore our curated product collections for every part of your car.",
    type: "website",
    siteName: "MOTOMAN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | MOTOMAN",
    description: "Explore our curated product collections for every part of your car.",
  },
};

export default async function CollectionsPage() {
  let collections = null;

  try {
    collections = await getCollections();
  } catch {
    // Database not available
  }

  return (
    <Container size="xl" className="py-8 md:py-12">
      <div className="mb-8">
        <Typography variant="overline" className="mb-2 text-orange-500">
          Browse
        </Typography>
        <Typography variant="h1" className="mb-2">
          Collections
        </Typography>
        <Typography variant="body" className="text-neutral-500">
          Explore our curated collections for every part of your car.
        </Typography>
      </div>

      <CollectionsGrid collections={collections ?? []} />
    </Container>
  );
}
