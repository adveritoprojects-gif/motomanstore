import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { getCategoryBySlug, getProducts } from "@/lib/queries";
import { CategoryContent } from "@/components/shop/category-content";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return { title: "Category Not Found" };
    }
    return {
      title: category.name,
      description:
        category.description ||
        `Shop ${category.name} products at MOTOMAN Premium Car Care.`,
      alternates: {
        canonical: `/categories/${category.slug}`,
      },
      openGraph: {
        title: `${category.name} | MOTOMAN`,
        description:
          category.description ||
          `Shop ${category.name} products at MOTOMAN Premium Car Care.`,
        type: "website",
        siteName: "MOTOMAN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} | MOTOMAN`,
        description:
          category.description ||
          `Shop ${category.name} products at MOTOMAN Premium Car Care.`,
      },
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let category = null;
  let products = null;
  let total = 0;
  let totalPages = 0;

  try {
    category = await getCategoryBySlug(slug);
    if (!category) {
      notFound();
    }

    const page = Number(sp.page) || 1;
    const result = await getProducts({
      category: slug,
      sort: (sp.sort as "price-asc" | "price-desc" | "newest" | "name") || "newest",
      page,
      limit: 12,
    });

    products = result.products;
    total = result.total;
    totalPages = result.totalPages;
  } catch {
    notFound();
  }

  return (
    <Container size="xl" className="py-8 md:py-12">
      {/* Category Header */}
      <div className="mb-8">
        <Typography variant="overline" className="mb-2 text-orange-500">
          Category
        </Typography>
        <Typography variant="h1" className="mb-2">
          {category!.name}
        </Typography>
        {category!.description && (
          <Typography variant="body" className="text-neutral-500">
            {category!.description}
          </Typography>
        )}
        <Typography variant="body-sm" className="mt-2 text-neutral-400">
          {total} product{total !== 1 ? "s" : ""}
        </Typography>
      </div>

      <CategoryContent
        products={products ?? []}
        total={total}
        totalPages={totalPages}
        currentPage={Number(sp.page) || 1}
        currentSort={sp.sort}
        categorySlug={slug}
      />
    </Container>
  );
}
