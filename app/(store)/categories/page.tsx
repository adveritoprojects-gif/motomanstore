import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCategories } from "@/lib/queries";
import { CategoryGrid } from "@/components/shop/category-grid";

export const metadata: Metadata = {
  title: "Car Care Product Categories",
  description:
    "Browse MOTOMAN car care categories — car wash, microfiber, exterior care and detailing accessories for every part of your vehicle.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Car Care Product Categories | MOTOMAN",
    description:
      "Browse MOTOMAN car care categories — car wash, microfiber, exterior care and accessories.",
    type: "website",
    siteName: "MOTOMAN",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Care Product Categories | MOTOMAN",
    description:
      "Browse MOTOMAN car care categories for every part of your vehicle.",
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
