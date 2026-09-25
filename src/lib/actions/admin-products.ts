"use server";

import { revalidatePath } from "next/cache";
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

export async function updateProductVariant(
  variantId: string,
  data: { price?: number | null; stock?: number; name?: string }
) {
  await requireAdmin();

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data,
  });

  revalidatePath("/admin/products");
  return variant;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
