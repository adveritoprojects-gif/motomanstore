import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCategories } from "@/lib/queries";
import { CategoryGrid } from "@/components/shop/category-grid";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse our car care categories. Find the right products for every part of your vehicle.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Categories | MOTOMAN",
    description: "Browse our car care categories for every part of your vehicle.",
    type: "website",
    siteName: "MOTOMAN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories | MOTOMAN",
    description: "Browse our car care categories for every part of your vehicle.",
  },
};

export default async function CategoriesPage() {
  let categories = null;

  try {
    categories = await getCategories();
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
          Categories
        </Typography>
        <Typography variant="body" className="text-neutral-500">
          Explore our curated collections for every part of your car.
        </Typography>
      </div>

      <CategoryGrid categories={categories ?? []} />
    </Container>
  );
}
