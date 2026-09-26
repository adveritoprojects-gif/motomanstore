export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProductById } from "@/lib/actions/admin-products";
import { ProductEditForm } from "@/components/admin/product-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Edit Product</h1>
        <p className="break-words text-sm text-neutral-500">
          {product.name} &middot; {formatPrice(product.price)}
        </p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          categoryId: product.categoryId,
          inStock: product.inStock,
          featured: product.featured,
          isNew: product.isNew,
          weight: product.weight,
          brand: product.brand,
          tags: product.tags,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
          })),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          })),
          category: product.category,
        }}
      />
    </div>
  );
}
