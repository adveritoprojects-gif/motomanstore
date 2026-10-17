"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isAllowedImageUrl, isBlobImageUrl } from "@/lib/product-images";

/** Refresh public catalog pages after an admin product change. */
function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/products/${slug}`);
}

/**
 * Removes a Vercel Blob object only when nothing still references its URL.
 * `public/` paths are never touched, and files still used by other products,
 * categories, collections or past orders are kept.
 */
async function deleteBlobIfUnreferenced(url: string): Promise<void> {
  if (!isBlobImageUrl(url)) return;
  try {
    const [images, orderItems, categories, collections] = await Promise.all([
      prisma.productImage.count({ where: { url } }),
      prisma.orderItem.count({ where: { image: url } }),
      prisma.category.count({ where: { image: url } }),
      prisma.collection.count({ where: { image: url } }),
    ]);
    if (images + orderItems + categories + collections > 0) return;
    await del(url);
  } catch (error) {
    // Never fail the admin action because blob cleanup failed (e.g. missing
    // BLOB_READ_WRITE_TOKEN locally) — the orphaned file is harmless.
    console.error("[images] skipped blob cleanup", error);
  }
}


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
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: true,
      collection: true,
    },
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

  const imageRows = data.images
    ? data.images.map((img, i) => {
        const url = img.url.trim();
        if (!isAllowedImageUrl(url)) throw new Error("Invalid image URL");
        return {
          url,
          alt: img.alt || data.name,
          sortOrder: img.sortOrder ?? i,
        };
      })
    : null;

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
      images: imageRows ? { create: imageRows } : undefined,
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
  revalidateCatalog();
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
  revalidateCatalog(product.slug);
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    select: { url: true },
  });
  await prisma.product.delete({ where: { id } });
  for (const image of images) {
    await deleteBlobIfUnreferenced(image.url);
  }
  revalidatePath("/admin/products");
  revalidateCatalog();
}

export async function addProductImage(
  productId: string,
  url: string,
  alt?: string
) {
  await requireAdmin();

  const normalizedUrl = url.trim();
  if (!isAllowedImageUrl(normalizedUrl)) {
    throw new Error("Invalid image URL");
  }

  const maxSort = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  const image = await prisma.productImage.create({
    data: {
      productId,
      url: normalizedUrl,
      alt: alt || "",
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath("/admin/products");
  revalidateCatalog(product?.slug);
  return image;
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();

  const image = await prisma.productImage.delete({
    where: { id: imageId },
    select: { url: true, product: { select: { slug: true } } },
  });

  await deleteBlobIfUnreferenced(image.url);
  revalidatePath("/admin/products");
  revalidateCatalog(image.product.slug);
}

/**
 * Deletes an uploaded Blob file that was never saved as a product image
 * (e.g. the admin removed it from the create form before saving). Still
 * guarded by the reference check, so shared files are never removed.
 */
export async function discardImageBlob(url: string) {
  await requireAdmin();
  await deleteBlobIfUnreferenced(url.trim());
}

/** Persists the drag/arrow order of a product's images in one transaction. */
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
) {
  await requireAdmin();

  const stored = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const storedIds = new Set(stored.map((s) => s.id));
  const uniqueIds = new Set(imageIds);
  const inSync =
    imageIds.length === stored.length &&
    uniqueIds.size === imageIds.length &&
    imageIds.every((id) => storedIds.has(id));
  if (!inSync) {
    throw new Error("Image order is out of sync — reload the page and retry");
  }

  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  revalidatePath("/admin/products");
  revalidateCatalog(product?.slug);
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
  revalidateCatalog(product.slug);
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
