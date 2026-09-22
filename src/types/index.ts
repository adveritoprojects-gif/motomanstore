import { Prisma } from "@prisma/client";

// ─── Prisma Payload Types ───────────────────────────────

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: { images: true; category: true; variants: true; collection: true };
}>;

export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export type CollectionWithCount = Prisma.CollectionGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

// ─── Search Params ──────────────────────────────────────

export interface ProductSearchParams {
  category?: string;
  collection?: string;
  featured?: boolean;
  isNew?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "name";
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: ProductWithImages[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Cart ───────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  variantId?: string;
  variantName?: string;
  maxStock?: number;
}

// ─── Address ────────────────────────────────────────────

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
