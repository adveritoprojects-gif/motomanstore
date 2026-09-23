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
      variants: true,
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
