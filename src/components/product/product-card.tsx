"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

// Unified product type that works with both Prisma and legacy data
interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string | null }[] | string[];
  isNew?: boolean;
  featured?: boolean;
  category?: { name: string; slug: string } | string | null;
  badge?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

function getImageSrc(images: ProductCardProduct["images"]): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return first;
    return first.url;
  }
  return "/placeholder-product.jpg";
}

function getImageAlt(images: ProductCardProduct["images"], name: string): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return name;
    return first.alt || name;
  }
  return name;
}

function getCategoryName(
  category: ProductCardProduct["category"]
): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name;
}

function getBadge(product: ProductCardProduct): string | null {
  if (product.badge) return product.badge;
  if (product.isNew) return "New";
  if (product.compareAtPrice) return "Sale";
  return null;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const badge = getBadge(product);
  const imageSrc = getImageSrc(product.images);
  const imageAlt = getImageAlt(product.images, product.name);
  const categoryName = getCategoryName(product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageSrc,
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border border-neutral-200 bg-white transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Image area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-50 p-4"
      >
        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
            )}
          />
        </button>

        {/* Badge */}
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {badge}
          </span>
        )}

        {/* Product image */}
        <div className="flex h-full w-full items-center justify-center">
          {imageSrc.startsWith("/") ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-100">
              <ShoppingBag className="h-10 w-10 text-neutral-300" />
            </div>
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-orange-500">
            {categoryName}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-1 text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 text-xs text-neutral-500 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-950">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-orange-600 active:bg-orange-700"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
