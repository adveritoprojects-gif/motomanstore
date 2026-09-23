import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryGridCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

interface CategoryGridProps {
  categories: CategoryGridCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          No categories yet
        </h3>
        <p className="text-sm text-neutral-500">
          Categories will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group relative flex h-[240px] flex-col justify-end overflow-hidden rounded-lg bg-neutral-900 transition-all duration-300 hover:shadow-lg lg:h-[280px]"
        >
          {/* Background placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <h2 className="mb-1 text-xl font-bold text-white">
              {category.name}
            </h2>
            <p className="mb-3 text-sm text-neutral-300">
              {category.description || ""}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                {category._count?.products ?? 0} products
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition-colors group-hover:text-orange-400">
                Shop Now <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
