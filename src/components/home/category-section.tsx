import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

// Unified category type
interface CategoryCardCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
  productCount?: number;
}

interface CategorySectionProps {
  categories?: CategoryCardCategory[];
}

function CategoryCard({ category }: { category: CategoryCardCategory }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex h-[220px] flex-col justify-end overflow-hidden rounded-lg bg-neutral-900 transition-all duration-300 hover:shadow-lg lg:h-[240px]"
    >
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 transition-transform duration-500 group-hover:scale-105" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 p-5">
        <h3 className="mb-1 text-lg font-bold text-white">{category.name}</h3>
        <p className="mb-3 text-xs text-neutral-300">
          {category.description || ""}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 transition-colors group-hover:text-orange-400">
          Shop Now <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export function CategorySection({ categories: propCategories }: CategorySectionProps) {
  // Use prop categories or fall back to static data
  const categories: CategoryCardCategory[] =
    propCategories && propCategories.length > 0
      ? propCategories
      : CATEGORIES.map((c) => ({
          ...c,
          description: c.description,
          image: c.image,
        }));

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Everything you need for a cleaner, shinier and better drive.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Desktop Grid */}
        <div className="hidden gap-5 md:grid md:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:hidden">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[200px] flex-shrink-0">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
