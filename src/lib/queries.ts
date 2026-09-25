import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// ─── Product Queries ────────────────────────────────────

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: { images: true; category: true; variants: true; collection: true };
}>;

export async function getProducts(params?: {
  category?: string;
  collection?: string;
  featured?: boolean;
  isNew?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "name";
  page?: number;
  limit?: number;
}) {
  const {
    category,
    collection,
    featured,
    isNew,
    search,
    sort = "newest",
    page = 1,
    limit = 12,
  } = params ?? {};

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = { slug: category };
  }

  if (collection) {
    where.collection = { slug: collection };
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (isNew !== undefined) {
    where.isNew = isNew;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { tags: { has: search.toLowerCase() } },
      { category: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      // Cheapest variant first — it matches the product's base price and is
      // the default selection on the product page.
      variants: { orderBy: { price: "asc" } },
      collection: true,
    },
  });
}

/**
 * Products for SEO landing pages — matches any of the given category slugs
 * or any of the given tags (OR between criteria). No filter = all products.
 */
export async function getLandingProducts(params?: {
  categorySlugs?: string[];
  tags?: string[];
  limit?: number;
}) {
  const { categorySlugs, tags, limit = 48 } = params ?? {};

  const clauses: Prisma.ProductWhereInput[] = [];
  if (categorySlugs && categorySlugs.length > 0) {
    clauses.push({ category: { slug: { in: categorySlugs } } });
  }
  if (tags && tags.length > 0) {
    clauses.push({ tags: { hasSome: tags } });
  }

  const where: Prisma.ProductWhereInput =
    clauses.length === 0 ? {} : clauses.length === 1 ? clauses[0] : { OR: clauses };

  return prisma.product.findMany({
    where,
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getFeaturedProducts(limit = 5) {
  return prisma.product.findMany({
    where: { featured: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Best sellers — ranked by total units sold across non-cancelled orders.
 * Falls back to featured (then newest) products to fill any remaining slots
 * so the homepage section always renders a full row.
 */
export async function getBestSellers(limit = 5) {
  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: { order: { status: { notIn: ["cancelled", "refunded"] } } },
  });

  const soldByProduct = new Map(
    sold.map((row) => [row.productId, row._sum.quantity ?? 0])
  );
  const rankedIds = [...soldByProduct.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  const include = { images: { orderBy: { sortOrder: "asc" as const } }, category: true } as const;

  const soldProducts = rankedIds.length
    ? await prisma.product.findMany({
        where: { id: { in: rankedIds }, inStock: true },
        include,
      })
    : [];

  const rank = new Map(rankedIds.map((id, index) => [id, index]));
  soldProducts.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

  const products = [...soldProducts];
  const pickedIds = () => products.map((p) => p.id);

  if (products.length < limit) {
    const fill = await prisma.product.findMany({
      where: { id: { notIn: pickedIds() }, inStock: true, featured: true },
      include,
      orderBy: { createdAt: "desc" },
      take: limit - products.length,
    });
    products.push(...fill);
  }

  if (products.length < limit) {
    const fill = await prisma.product.findMany({
      where: { id: { notIn: pickedIds() }, inStock: true },
      include,
      orderBy: { createdAt: "desc" },
      take: limit - products.length,
    });
    products.push(...fill);
  }

  return products;
}

export async function getNewProducts(limit = 5) {
  return prisma.product.findMany({
    where: { isNew: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      category: { slug: categorySlug },
    },
    include: { images: true, category: true },
    take: limit,
  });
}

// ─── Category Queries ───────────────────────────────────

export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });
}

// ─── Collection Queries ─────────────────────────────────

export async function getCollections() {
  return prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      products: { include: { images: true, category: true } },
      _count: { select: { products: true } },
    },
  });
}

// ─── Search ─────────────────────────────────────────────

export async function searchProducts(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { sku: { contains: trimmed, mode: "insensitive" } },
        { tags: { has: trimmed.toLowerCase() } },
        { category: { name: { contains: trimmed, mode: "insensitive" } } },
        { brand: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    include: { images: true, category: true },
    take: 20,
  });
}
