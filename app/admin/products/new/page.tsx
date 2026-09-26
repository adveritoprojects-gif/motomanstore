"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { createProduct, getCategories } from "@/lib/actions/admin-products";
import { FormToast } from "@/components/admin";

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    compareAtPrice: "",
    metaTitle: "",
    metaDescription: "",
    categoryId: "",
    brand: "MOTOMAN",
    weight: "",
    tags: "",
    inStock: true,
    featured: false,
    isNew: false,
  });

  const [variants, setVariants] = useState<
    { name: string; sku: string; price: string; stock: string }[]
  >([{ name: "Default", sku: "", price: "", stock: "10" }]);

  useEffect(() => {
    getCategories().then((cats) =>
      setCategories(cats.map((c) => ({ id: c.id, name: c.name })))
    );
  }, []);

  const inputClass =
    "w-full min-h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-orange-500 md:py-2 md:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.sku || !form.price || !form.categoryId) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const product = await createProduct({
        name: form.name,
        slug: form.slug || slugify(form.name),
        sku: form.sku,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        categoryId: form.categoryId,
        brand: form.brand || null,
        weight: form.weight ? Number(form.weight) : null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        inStock: form.inStock,
        featured: form.featured,
        isNew: form.isNew,
        variants: variants
          .filter((v) => v.name && v.sku)
          .map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price ? Number(v.price) : null,
            stock: Number(v.stock) || 0,
          })),
      });
      router.push(`/admin/products/${product.id}`);
    } catch {
      setError("Failed to create product");
    }
    setIsSaving(false);
  };

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
        <h1 className="text-xl font-bold text-neutral-950 sm:text-2xl">Add Product</h1>
        <p className="text-sm text-neutral-500">
          Create a new product for your store
        </p>
      </div>

      {error && <FormToast type="error" text={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
            Basic Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value })
                }
                className={inputClass}
                placeholder={slugify(form.name || "product-name")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                SKU *
              </label>
              <input
                value={form.sku}
                onChange={(e) =>
                  setForm({ ...form, sku: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Category *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className={inputClass}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) =>
                  setForm({ ...form, brand: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Tags (comma-separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) =>
                  setForm({ ...form, tags: e.target.value })
                }
                className={inputClass}
                placeholder="car care, premium"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">Pricing</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Price (INR) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                className={inputClass}
                inputMode="decimal"
                required
                min="1"
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
                onChange={(e) =>
                  setForm({ ...form, weight: e.target.value })
                }
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-950">Variants</h2>
            <button
              type="button"
              onClick={() =>
                setVariants([
                  ...variants,
                  { name: "", sku: "", price: "", stock: "0" },
                ])
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-3 sm:flex sm:flex-wrap sm:items-end"
              >
                <div className="col-span-2 sm:col-span-1 sm:min-w-[120px] sm:flex-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-500">
                    Name
                  </label>
                  <input
                    value={v.name}
                    onChange={(e) => {
                      const nv = [...variants];
                      nv[i].name = e.target.value;
                      setVariants(nv);
                    }}
                    className={inputClass}
                    placeholder="e.g. 500ml"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 sm:min-w-[120px] sm:flex-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-500">
                    SKU
                  </label>
                  <input
                    value={v.sku}
                    onChange={(e) => {
                      const nv = [...variants];
                      nv[i].sku = e.target.value;
                      setVariants(nv);
                    }}
                    className={inputClass}
                    autoCapitalize="characters"
                    autoCorrect="off"
                  />
                </div>
                <div className="sm:w-24">
                  <label className="mb-1 block text-xs font-medium text-neutral-500">
                    Price
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={v.price}
                    onChange={(e) => {
                      const nv = [...variants];
                      nv[i].price = e.target.value;
                      setVariants(nv);
                    }}
                    className={inputClass}
                  />
                </div>
                <div className="sm:w-24">
                  <label className="mb-1 block text-xs font-medium text-neutral-500">
                    Stock
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => {
                      const nv = [...variants];
                      nv[i].stock = e.target.value;
                      setVariants(nv);
                    }}
                    className={inputClass}
                  />
                </div>
                {variants.length > 1 && (
                  <div className="flex items-end justify-end sm:justify-start">
                    <button
                      type="button"
                      onClick={() =>
                        setVariants(variants.filter((_, j) => j !== i))
                      }
                      aria-label={`Remove variant ${i + 1}`}
                      className="flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-neutral-950 sm:text-lg">
            Search Preview (SEO)
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </div>
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

        <div className="sticky bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0 lg:static">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isSaving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
