"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateProduct,
  deleteProduct,
  updateProductVariant,
} from "@/lib/actions/admin-products";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    categoryId: string;
    inStock: boolean;
    featured: boolean;
    isNew: boolean;
    weight: number | null;
    brand: string | null;
    tags: string[];
    images: { id: string; url: string; alt: string | null; sortOrder: number }[];
    variants: {
      id: string;
      name: string;
      sku: string;
      price: number | null;
      stock: number;
    }[];
    category: { name: string; id: string };
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? "",
    inStock: product.inStock,
    featured: product.featured,
    isNew: product.isNew,
    weight: product.weight ?? "",
    brand: product.brand ?? "",
    tags: product.tags.join(", "),
  });

  const [variants, setVariants] = useState(
    product.variants.map((v) => ({ ...v }))
  );

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProduct(product.id, {
        name: form.name,
        slug: form.slug,
        sku: form.sku,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,
        inStock: form.inStock,
        featured: form.featured,
        isNew: form.isNew,
        weight: form.weight ? Number(form.weight) : null,
        brand: form.brand || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      for (const variant of variants) {
        await updateProductVariant(variant.id, {
          price: variant.price,
          stock: variant.stock,
          name: variant.name,
        });
      }

      setMessage({ type: "success", text: "Product updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update product" });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push("/admin/products");
    } catch {
      setMessage({ type: "error", text: "Failed to delete product" });
      setIsDeleting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-orange-500";

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-950">
          Basic Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              SKU
            </label>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Brand
            </label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={4}
            className={cn(inputClass, "resize-none")}
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tags (comma-separated)
          </label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className={inputClass}
            placeholder="car care, premium, wash"
          />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-950">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Price (INR)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Compare Price
            </label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) =>
                setForm({ ...form, compareAtPrice: e.target.value })
              }
              className={inputClass}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Weight (g)
            </label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-950">
          Variants & Stock
        </h2>
        {variants.length === 0 ? (
          <p className="text-sm text-neutral-500">No variants for this product.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-3"
              >
                <span className="text-sm font-medium text-neutral-700 min-w-[120px]">
                  {v.name}
                </span>
                <span className="text-xs text-neutral-400">{v.sku}</span>
                <input
                  type="number"
                  value={v.price ?? ""}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[i].price = e.target.value
                      ? Number(e.target.value)
                      : null;
                    setVariants(newVariants);
                  }}
                  className="w-24 rounded border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-orange-500"
                  placeholder="Price"
                />
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[i].stock = Number(e.target.value);
                    setVariants(newVariants);
                  }}
                  className="w-20 rounded border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-orange-500"
                  placeholder="Stock"
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    v.stock <= 5 ? "text-red-600" : "text-green-600"
                  )}
                >
                  {v.stock <= 5 ? "Low" : "OK"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-950">Options</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) =>
                setForm({ ...form, inStock: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-neutral-700">In Stock</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-neutral-700">Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) =>
                setForm({ ...form, isNew: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-neutral-700">New Arrival</span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-950">
          Images ({product.images.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {product.images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                Image
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Image upload via Cloudinary integration coming soon.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Product"}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
