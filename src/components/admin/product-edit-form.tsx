"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog, FormToast } from "@/components/admin";
import {
  updateProduct,
  deleteProduct,
  updateProductVariant,
  addProductImage,
  deleteProductImage,
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
    metaTitle: string | null;
    metaDescription: string | null;
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
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

  const [images, setImages] = useState(
    product.images.map((img) => ({ ...img }))
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [isImageBusy, setIsImageBusy] = useState(false);

  const handleAddImage = async () => {
    const url = newImageUrl.trim();
    if (!url || isImageBusy) return;
    setIsImageBusy(true);
    try {
      const created = await addProductImage(
        product.id,
        url,
        newImageAlt.trim() || product.name
      );
      setImages((prev) => [...prev, { ...created, alt: created.alt || "" }]);
      setNewImageUrl("");
      setNewImageAlt("");
    } catch {
      setMessage({ type: "error", text: "Failed to add image" });
    }
    setIsImageBusy(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (isImageBusy) return;
    setIsImageBusy(true);
    try {
      await deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setMessage({ type: "error", text: "Failed to delete image" });
    }
    setIsImageBusy(false);
  };

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
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
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
          sku: variant.sku,
        });
      }

      setMessage({ type: "success", text: "Product updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update product" });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push("/admin/products");
    } catch {
      setMessage({ type: "error", text: "Failed to delete product" });
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const inputClass =
    "w-full min-h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-orange-500 md:py-2 md:text-sm";

  return (
    <div className="space-y-6">
      {message && <FormToast type={message.type} text={message.text} />}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
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

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">Pricing</h2>
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

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
          Variants & Stock
        </h2>
        {variants.length === 0 ? (
          <p className="text-sm text-neutral-500">No variants for this product.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={v.id}
                className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-3 sm:flex sm:flex-wrap sm:items-center"
              >
                <div className="col-span-2 sm:col-span-1 sm:w-28">
                  <label className="mb-1 block text-xs text-neutral-500 sm:sr-only">
                    Variant name
                  </label>
                  <input
                    value={v.name}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[i].name = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="min-h-11 w-full rounded border border-neutral-200 bg-white px-2 py-2 text-base outline-none focus:border-orange-500 sm:py-1 sm:text-sm"
                    placeholder="Name"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 sm:w-36">
                  <label className="mb-1 block text-xs text-neutral-500 sm:sr-only">
                    SKU
                  </label>
                  <input
                    value={v.sku}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[i].sku = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="min-h-11 w-full rounded border border-neutral-200 bg-white px-2 py-2 text-base outline-none focus:border-orange-500 sm:py-1 sm:text-sm"
                    placeholder="SKU"
                  />
                </div>
                <div className="sm:w-24">
                  <label className="mb-1 block text-xs text-neutral-500 sm:sr-only">
                    Price
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={v.price ?? ""}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[i].price = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setVariants(newVariants);
                    }}
                    className="min-h-11 w-full rounded border border-neutral-200 bg-white px-2 py-2 text-base outline-none focus:border-orange-500 sm:py-1 sm:text-sm"
                    placeholder="Price"
                  />
                </div>
                <div className="sm:w-24">
                  <label className="mb-1 block text-xs text-neutral-500 sm:sr-only">
                    Stock
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[i].stock = Number(e.target.value);
                      setVariants(newVariants);
                    }}
                    className="min-h-11 w-full rounded border border-neutral-200 bg-white px-2 py-2 text-base outline-none focus:border-orange-500 sm:py-1 sm:text-sm"
                    placeholder="Stock"
                  />
                </div>
                <span
                  className={cn(
                    "self-center text-xs font-medium sm:self-auto",
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

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">Options</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex min-h-11 items-center gap-2 sm:min-h-0">
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
          <label className="flex min-h-11 items-center gap-2 sm:min-h-0">
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
          <label className="flex min-h-11 items-center gap-2 sm:min-h-0">
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

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
          Search Preview (SEO)
        </h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              SEO Title
            </label>
            <input
              value={form.metaTitle}
              onChange={(e) =>
                setForm({ ...form, metaTitle: e.target.value })
              }
              className={inputClass}
              placeholder="Leave blank to generate from the product name"
            />
            <p className="mt-1 text-xs text-neutral-400">
              {form.metaTitle.length}/60 characters recommended
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Meta Description
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) =>
                setForm({ ...form, metaDescription: e.target.value })
              }
              rows={3}
              className={cn(inputClass, "resize-none")}
              placeholder="Leave blank to generate from the product description"
            />
            <p className="mt-1 text-xs text-neutral-400">
              {form.metaDescription.length}/160 characters recommended
            </p>
          </div>
        </div>

        {/* Search result preview */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-1 truncate text-lg text-blue-700">
            {form.metaTitle.trim() || form.name}
          </p>
          <p className="mb-1 text-xs text-green-700">
            motomanstore.com › products › {form.slug}
          </p>
          <p className="text-sm text-neutral-600 line-clamp-2">
            {form.metaDescription.trim() || form.description}
          </p>
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Keywords come from Tags — they are published as the page keywords and
          used by storefront search.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
          Images ({images.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <Image
                src={img.url}
                alt={img.alt || `${product.name} — image ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain"
              />
              <span className="absolute left-1 top-1 rounded bg-neutral-900/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {i === 0 ? "Hero" : i + 1}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                disabled={isImageBusy}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded bg-red-600/90 text-white transition-colors hover:bg-red-700 lg:h-6 lg:w-6 lg:opacity-0 lg:group-hover:opacity-100 disabled:opacity-50"
                aria-label={`Delete image ${i + 1}`}
              >
                <Trash2 className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex-1 sm:min-w-[240px]">
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Image path or URL
            </label>
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className={cn(inputClass, "text-sm")}
              placeholder="/products/my-image.jpg"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="flex-1 sm:min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Alt text (optional)
            </label>
            <input
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              className={cn(inputClass, "text-sm")}
              placeholder={product.name}
            />
          </div>
          <button
            type="button"
            onClick={handleAddImage}
            disabled={isImageBusy || !newImageUrl.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
          >
            {isImageBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add image
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Images are stored under <code>public/</code> and served from the same
          origin. The first image is always the hero image.
        </p>
      </div>

      <div className="sticky bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0 lg:static">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={isDeleting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Product"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete product?"
        message={`"${product.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
