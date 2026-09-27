"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getProducts(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { search, categoryId, page = 1, limit = 20 } = params ?? {};

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true, variants: true },
      orderBy: { createdAt: "desc" },
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

export async function getProductById(id: string) {
  await requireAdmin();

  return prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, variants: true, collection: true },
  });
}

export async function createProduct(data: {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId: string;
  collectionId?: string | null;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  weight?: number | null;
  brand?: string | null;
  tags?: string[];
  images?: { url: string; alt?: string; sortOrder?: number }[];
  variants?: {
    name: string;
    sku: string;
    price?: number | null;
    stock?: number;
    size?: string | null;
    color?: string | null;
  }[];
}) {
  await requireAdmin();

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      categoryId: data.categoryId,
      collectionId: data.collectionId ?? null,
      inStock: data.inStock ?? true,
      featured: data.featured ?? false,
      isNew: data.isNew ?? false,
      weight: data.weight ?? null,
      brand: data.brand ?? null,
      tags: data.tags ?? [],
      images: data.images
        ? {
            create: data.images.map((img, i) => ({
              url: img.url,
              alt: img.alt || data.name,
              sortOrder: img.sortOrder ?? i,
            })),
          }
        : undefined,
      variants: data.variants
        ? {
            create: data.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: v.price ?? null,
              stock: v.stock ?? 0,
              size: v.size ?? null,
              color: v.color ?? null,
            })),
          }
        : undefined,
    },
    include: { images: true, variants: true, category: true },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    categoryId?: string;
    collectionId?: string | null;
    inStock?: boolean;
    featured?: boolean;
    isNew?: boolean;
    weight?: number | null;
    brand?: string | null;
    tags?: string[];
  }
) {
  await requireAdmin();

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { images: true, variants: true, category: true },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/shop");
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function addProductImage(
  productId: string,
  url: string,
  alt?: string
) {
  await requireAdmin();

  const maxSort = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  const image = await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: alt || "",
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/products");
  return image;
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();

  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath("/admin/products");
}

export type VariantInput = {
  id?: string;
  name: string;
  sku: string;
  price: number | null;
  stock: number;
};

export type SavedVariant = {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stock: number;
};

export type SaveVariantsResult =
  | { ok: true; variants: SavedVariant[] }
  | { ok: false; error: string };

/**
 * Applies the whole Variants & Stock list of a product in one transaction:
 * creates rows without an id, updates rows with an id and deletes stored
 * variants that are no longer in the list.
 */
export async function saveProductVariants(
  productId: string,
  variants: VariantInput[]
): Promise<SaveVariantsResult> {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) return { ok: false, error: "Product not found" };

  const normalized: { id?: string; name: string; sku: string; price: number | null; stock: number }[] = [];
  const seenSkus = new Set<string>();

  for (const v of variants) {
    const name = (v.name ?? "").trim();
    const sku = (v.sku ?? "").trim();
    if (!name) return { ok: false, error: "Every variant needs a name" };
    if (!sku) return { ok: false, error: `SKU is required for variant "${name}"` };

    const stock = Math.trunc(Number(v.stock));
    if (!Number.isFinite(stock) || stock < 0) {
      return { ok: false, error: `Stock for "${name}" must be 0 or more` };
    }

    const price = v.price === null || v.price === undefined ? null : Number(v.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      return { ok: false, error: `Price for "${name}" must be 0 or more` };
    }

    const key = sku.toLowerCase();
    if (seenSkus.has(key)) return { ok: false, error: `Duplicate SKU "${sku}"` };
    seenSkus.add(key);

    normalized.push({ id: v.id, name, sku, price, stock });
  }

  const stored = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const storedIds = new Set(stored.map((s) => s.id));
  for (const v of normalized) {
    if (v.id && !storedIds.has(v.id)) {
      return { ok: false, error: "A variant was changed elsewhere — reload the page and try again" };
    }
  }

  try {
    const saved = await prisma.$transaction(async (tx) => {
      const keepIds = normalized.filter((v) => v.id).map((v) => v.id as string);
      const removeIds = stored.map((s) => s.id).filter((id) => !keepIds.includes(id));
      if (removeIds.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: removeIds }, productId } });
      }

      const rows: SavedVariant[] = [];
      for (const v of normalized) {
        const data = { name: v.name, sku: v.sku, price: v.price, stock: v.stock };
        const row = v.id
          ? await tx.productVariant.update({ where: { id: v.id }, data })
          : await tx.productVariant.create({ data: { ...data, productId } });
        rows.push({
          id: row.id,
          name: row.name,
          sku: row.sku,
          price: row.price,
          stock: row.stock,
        });
      }
      return rows;
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/shop");
    return { ok: true, variants: saved };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "That SKU is already used by another variant" };
    }
    return { ok: false, error: "Failed to save variants" };
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
