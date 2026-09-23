"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ProductImageGallery } from "./product-image-gallery";
import { MobileStickyPurchaseBar } from "./mobile-sticky-purchase-bar";

interface ProductDetailProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  inStock: boolean;
  featured?: boolean;
  isNew?: boolean;
  brand?: string | null;
  tags?: string[];
  weight?: number | null;
  category: { name: string; slug: string };
  collection?: { name: string; slug: string } | null;
  images: { url: string; alt?: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price?: number | null;
    stock: number;
    size?: string | null;
    color?: string | null;
  }[];
}

interface ProductDetailProps {
  product: ProductDetailProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const currentVariant = product.variants.find(
    (v) => v.id === selectedVariant
  );
  const displayPrice = currentVariant?.price ?? product.price;
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > displayPrice;
  const inStock = product.inStock && (!currentVariant || currentVariant.stock > 0);
  const maxQty = currentVariant?.stock ?? 999;

  const handleAddToCart = () => {
    const thumbnail = product.images[0]?.url || "/placeholder-product.jpg";
    addItem(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: thumbnail,
        variantId: currentVariant?.id,
        variantName: currentVariant?.name,
        size: currentVariant?.size || undefined,
        color: currentVariant?.color || undefined,
        maxStock: currentVariant?.stock,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/" className="hover:text-orange-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-orange-500 transition-colors">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-orange-500 transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-neutral-900" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Product Info */}
        <div>
          {/* Category & Badges */}
          <div className="mb-3 flex items-center gap-2">
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-medium uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors"
            >
              {product.category.name}
            </Link>
            {product.isNew && (
              <span className="rounded bg-green-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Sale
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-2xl font-bold text-neutral-950 lg:text-3xl">
            {product.name}
          </h1>

          {/* Brand */}
          {product.brand && (
            <p className="mb-2 text-sm text-neutral-500">
              by{" "}
              <span className="font-medium text-neutral-700">
                {product.brand}
              </span>
            </p>
          )}

          {/* SKU */}
          <p className="mb-4 text-xs text-neutral-400">SKU: {product.sku}</p>

          {/* Price */}
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-neutral-950">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  {Math.round(
                    ((product.compareAtPrice! - displayPrice) /
                      product.compareAtPrice!) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="mb-6 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= 4
                      ? "fill-orange-400 text-orange-400"
                      : "fill-neutral-200 text-neutral-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-500">(4.0)</span>
            <span className="text-xs text-neutral-400">| 24 reviews</span>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant.id);
                      setQuantity(1);
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      selectedVariant === variant.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
                      variant.stock === 0 &&
                        "cursor-not-allowed opacity-50"
                    )}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                    {variant.price && variant.price !== product.price && (
                      <span className="ml-1 text-xs text-neutral-500">
                        {formatPrice(variant.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-neutral-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                -
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-neutral-200 text-sm font-medium text-neutral-700">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(quantity + 1, maxQty))
                }
                disabled={quantity >= maxQty}
                className="flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg border transition-all",
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
              )}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={cn("h-5 w-5", isWishlisted && "fill-current")}
              />
            </button>
          </div>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-neutral-900 bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Truck className="h-5 w-5 text-neutral-600" aria-hidden="true" />
              <span className="text-[11px] font-medium text-neutral-600">
                Free Shipping
              </span>
              <span className="text-[10px] text-neutral-400">
                On orders above ₹999
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Shield className="h-5 w-5 text-neutral-600" aria-hidden="true" />
              <span className="text-[11px] font-medium text-neutral-600">
                Secure Payment
              </span>
              <span className="text-[10px] text-neutral-400">
                100% safe checkout
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <RotateCcw className="h-5 w-5 text-neutral-600" aria-hidden="true" />
              <span className="text-[11px] font-medium text-neutral-600">
                Easy Returns
              </span>
              <span className="text-[10px] text-neutral-400">
                7-day return policy
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">
              Product Details
            </h2>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                <span>SKU: {product.sku}</span>
              </div>
              {product.weight && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <span>Weight: {product.weight}g</span>
                </div>
              )}
              {product.collection && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <span>Collection: {product.collection.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs text-neutral-400">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Placeholder */}
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= 4
                        ? "fill-orange-400 text-orange-400"
                        : "fill-neutral-200 text-neutral-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-neutral-700">
                4.0 out of 5
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Based on 24 customer reviews
            </p>
            <div className="mt-4 space-y-4">
              {[
                {
                  name: "Rahul S.",
                  rating: 5,
                  date: "2 weeks ago",
                  text: "Excellent product quality. The foam distribution is even and the build quality is outstanding.",
                },
                {
                  name: "Priya M.",
                  rating: 4,
                  date: "1 month ago",
                  text: "Great value for money. Would recommend to any car enthusiast looking for premium care products.",
                },
              ].map((review, i) => (
                <div key={i} className="border-b border-neutral-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3 w-3",
                            star <= review.rating
                              ? "fill-orange-400 text-orange-400"
                              : "fill-neutral-200 text-neutral-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-neutral-700">
                      {review.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {review.date}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <MobileStickyPurchaseBar
        price={displayPrice}
        compareAtPrice={product.compareAtPrice}
        inStock={inStock}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </>
  );
}
