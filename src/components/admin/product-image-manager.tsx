"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { uploadPresigned } from "@vercel/blob/client";
import { cn } from "@/lib/utils";
import {
  addProductImage,
  deleteProductImage,
  discardImageBlob,
  reorderProductImages,
} from "@/lib/actions/admin-products";
import {
  PRODUCT_IMAGE_CONTENT_TYPES,
  buildProductImagePathname,
  formatBytes,
  getMaxProductImageBytes,
  isAllowedImageUrl,
  isBlobImageUrl,
  validateProductImageBytes,
  validateProductImageFile,
} from "@/lib/product-images";

export interface ManagedProductImage {
  id?: string;
  url: string;
  alt: string;
}

type PendingUpload = {
  key: string;
  name: string;
  previewUrl: string;
  progress: number;
  status: "queued" | "uploading" | "saving";
};

interface ProductImageManagerProps {
  productName: string;
  images: ManagedProductImage[];
  /** React setter (or updater fn) — image changes always flow through here. */
  onImagesChange: (
    update:
      | ManagedProductImage[]
      | ((prev: ManagedProductImage[]) => ManagedProductImage[])
  ) => void;
  /**
   * When set, upload/remove/replace/reorder are persisted immediately via
   * admin server actions. Without it (new-product form) images stay local
   * until the product is created.
   */
  productId?: string;
  defaultAlt?: string;
  /** Reports whether an image operation is in flight (for parent forms). */
  onBusyChange?: (busy: boolean) => void;
}

function createKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function describeUploadError(error: unknown, maxBytes: number): string {
  const message = error instanceof Error ? error.message : "";
  if (/too large/i.test(message)) {
    return `File is larger than the ${formatBytes(maxBytes)} limit`;
  }
  if (/content type mismatch|content-type.*not allowed/i.test(message)) {
    return "This file type is not allowed";
  }
  if (/Failed to retrieve the client token|Failed to retrieve the presigned URL/i.test(message)) {
    return "Could not start the upload — check that you are signed in as an admin and that image uploads are configured on the server.";
  }
  if (/store does not exist|suspended|access denied/i.test(message)) {
    return "Blob storage is unavailable — check BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID.";
  }
  if (error instanceof TypeError || /fetch|network/i.test(message)) {
    return "Network error — the upload could not be completed";
  }
  console.error("[product-images] upload failed", error);
  return "Upload failed — the file was not saved";
}

export function ProductImageManager({
  productName,
  images,
  onImagesChange,
  productId,
  defaultAlt,
  onBusyChange,
}: ProductImageManagerProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [maxBytes, setMaxBytes] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [manualAlt, setManualAlt] = useState("");

  const busyRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const limit = maxBytes ?? getMaxProductImageBytes();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/uploads");
        if (!res.ok) throw new Error("config unavailable");
        const data = (await res.json()) as {
          maxBytes?: number;
          configured?: boolean;
        };
        if (!active) return;
        if (typeof data.maxBytes === "number" && data.maxBytes > 0) {
          setMaxBytes(data.maxBytes);
        }
        if (data.configured === false) {
          setWarning(
            "Image uploads are not configured on this server (Vercel Blob credentials are missing). Adding images by path or URL still works."
          );
        }
      } catch {
        // Keep the built-in defaults; upload attempts still surface errors.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(busy || pending.length > 0);
  }, [busy, pending.length, onBusyChange]);

  const acquire = () => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setErrors([]);
    return true;
  };

  const release = () => {
    busyRef.current = false;
    setBusy(false);
  };

  const altFor = (value: string) =>
    value.trim() ||
    defaultAlt?.trim() ||
    productName.trim() ||
    "Product image";

  const openFilePicker = (replaceIndex: number | null) => {
    if (busyRef.current) return;
    replaceIndexRef.current = replaceIndex;
    const input = fileInputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const replaceIndex = replaceIndexRef.current;
    replaceIndexRef.current = null;
    e.target.value = "";
    if (files.length === 0) return;
    void uploadFiles(replaceIndex !== null ? files.slice(0, 1) : files, replaceIndex);
  };

  const uploadFiles = async (files: File[], replaceIndex: number | null) => {
    if (files.length === 0 || !acquire()) return;

    try {
      const accepted: File[] = [];
      const problems: string[] = [];
      for (const file of files) {
        const check = validateProductImageFile({
          name: file.name,
          type: file.type,
          size: file.size,
          maxBytes: limit,
        });
        if (!check.ok) {
          problems.push(check.error);
          continue;
        }
        const bytesCheck = await validateProductImageBytes(file);
        if (!bytesCheck.ok) {
          problems.push(bytesCheck.error);
          continue;
        }
        accepted.push(file);
        if (replaceIndex !== null) break; // replace only swaps in one file
      }
      if (problems.length > 0) setErrors(problems);
      if (accepted.length === 0) return;

      const queue: PendingUpload[] = accepted.map((file) => ({
        key: createKey(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "queued",
      }));
      setPending((prev) => [...prev, ...queue]);

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        const file = accepted[i];
        setPending((prev) =>
          prev.map((p) =>
            p.key === item.key ? { ...p, status: "uploading" } : p
          )
        );
        try {
          const pathname = buildProductImagePathname(file);
          const blob = await uploadPresigned(pathname, file, {
            access: "public",
            handleUploadUrl: "/api/admin/uploads",
            contentType: file.type,
            onUploadProgress: ({ percentage }) => {
              const progress = Math.max(0, Math.min(100, Math.round(percentage)));
              setPending((prev) =>
                prev.map((p) =>
                  p.key === item.key ? { ...p, progress } : p
                )
              );
            },
          });
          setPending((prev) =>
            prev.map((p) =>
              p.key === item.key
                ? { ...p, status: "saving", progress: 100 }
                : p
            )
          );

          if (replaceIndex !== null) {
            await applyReplacement(blob.url, replaceIndex);
          } else if (productId) {
            const created = await addProductImage(
              productId,
              blob.url,
              altFor("")
            );
            onImagesChange((prev) => [
              ...prev,
              { id: created.id, url: created.url, alt: created.alt || "" },
            ]);
          } else {
            const url = blob.url;
            onImagesChange((prev) => [...prev, { url, alt: altFor("") }]);
          }
        } catch (error) {
          setErrors((prev) => [...prev, describeUploadError(error, limit)]);
        } finally {
          URL.revokeObjectURL(item.previewUrl);
          setPending((prev) => prev.filter((p) => p.key !== item.key));
        }
      }
    } finally {
      release();
    }
  };

  /** Swap image at `index` for a freshly uploaded blob URL. */
  const applyReplacement = async (newUrl: string, index: number) => {
    const old = images[index];
    if (!old) return;
    const alt = old.alt || altFor("");

    if (productId) {
      const created = await addProductImage(productId, newUrl, alt);
      const next = images.map((img, i) =>
        i === index
          ? { id: created.id, url: created.url, alt: created.alt || "" }
          : img
      );
      if (old.id) {
        await deleteProductImage(old.id);
      } else if (isBlobImageUrl(old.url)) {
        await discardImageBlob(old.url);
      }
      onImagesChange(next);
      if (next.every((img) => img.id)) {
        await reorderProductImages(
          productId,
          next.map((img) => img.id as string)
        );
      }
    } else {
      const next = images.map((img, i) =>
        i === index ? { url: newUrl, alt } : img
      );
      onImagesChange(next);
      if (isBlobImageUrl(old.url)) {
        await discardImageBlob(old.url);
      }
    }
  };

  const handleRemove = async (index: number) => {
    const image = images[index];
    if (!image || !acquire()) return;
    try {
      if (image.id) {
        await deleteProductImage(image.id);
      } else if (isBlobImageUrl(image.url)) {
        await discardImageBlob(image.url);
      }
      onImagesChange((prev) => prev.filter((_, i) => i !== index));
    } catch {
      setErrors(["Failed to remove image"]);
    } finally {
      release();
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length || !acquire()) return;
    try {
      const next = [...images];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      onImagesChange(next);
      if (productId && next.every((img) => img.id)) {
        await reorderProductImages(
          productId,
          next.map((img) => img.id as string)
        );
      }
    } catch {
      setErrors([
        "Failed to save the new image order — reload the page to see the stored order",
      ]);
    } finally {
      release();
    }
  };

  const handleManualAdd = async () => {
    const url = manualUrl.trim();
    if (!url) return;
    if (!isAllowedImageUrl(url)) {
      setErrors(['Image path must start with "/" or "https://"']);
      return;
    }
    if (!acquire()) return;
    try {
      const alt = altFor(manualAlt);
      if (productId) {
        const created = await addProductImage(productId, url, alt);
        onImagesChange((prev) => [
          ...prev,
          { id: created.id, url: created.url, alt: created.alt || "" },
        ]);
      } else {
        onImagesChange((prev) => [...prev, { url, alt }]);
      }
      setManualUrl("");
      setManualAlt("");
    } catch {
      setErrors(["Failed to add image"]);
    } finally {
      release();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    void uploadFiles(files, null);
  };

  const tileButtonClass =
    "flex h-7 w-7 items-center justify-center rounded bg-neutral-900/70 text-white transition-colors hover:bg-neutral-900 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

  return (
    <div
      className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-950 sm:text-lg">
          Images ({images.length})
        </h2>
        {(busy || pending.length > 0) && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Working…
          </span>
        )}
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-3 space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errors.map((message, i) => (
            <p key={i}>{message}</p>
          ))}
        </div>
      )}

      {warning && (
        <div
          role="status"
          className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700"
        >
          {warning}
        </div>
      )}

      {images.length > 0 || pending.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.id ?? img.url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} — image ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain"
              />
              <span className="absolute left-1 top-1 rounded bg-neutral-900/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {i === 0 ? "Hero" : i + 1}
              </span>
              <div className="absolute right-1 top-1 flex gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={busy || i === 0}
                  aria-label={`Move image ${i + 1} earlier`}
                  className={tileButtonClass}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={busy || i === images.length - 1}
                  aria-label={`Move image ${i + 1} later`}
                  className={tileButtonClass}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openFilePicker(i)}
                  disabled={busy}
                  aria-label={`Replace image ${i + 1}`}
                  className={tileButtonClass}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  disabled={busy}
                  aria-label={`Remove image ${i + 1}`}
                  className={cn(
                    tileButtonClass,
                    "hover:bg-red-700"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {pending.map((item) => (
            <div
              key={item.key}
              className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-orange-300 bg-neutral-50"
            >
              <Image
                src={item.previewUrl}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain opacity-60"
              />
              <div className="absolute inset-x-0 bottom-0 bg-neutral-900/60 p-2">
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-medium text-white">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0">
                    {item.status === "queued"
                      ? "Queued"
                      : item.status === "saving"
                        ? "Saving…"
                        : `${item.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-[width] duration-200"
                    style={{
                      width: `${
                        item.status === "saving"
                          ? 100
                          : item.status === "queued"
                            ? 0
                            : item.progress
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600">
            No images yet
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Upload files or add an existing image path below. The first image
            becomes the hero image.
          </p>
        </div>
      )}

      <div
        className={cn(
          "mt-4 rounded-lg border border-dashed p-4 text-center transition-colors",
          dragging
            ? "border-orange-500 bg-orange-50/60"
            : "border-neutral-300 bg-neutral-50/60"
        )}
      >
        <button
          type="button"
          onClick={() => openFilePicker(null)}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
        >
          <Upload className="h-4 w-4" />
          Upload images
        </button>
        <p className="mt-2 text-xs text-neutral-400">
          or drag &amp; drop here — JPEG, PNG, WebP, AVIF or GIF, up to{" "}
          {formatBytes(limit)} each
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 sm:min-w-[240px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Image path or URL
          </label>
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            disabled={busy}
            className="w-full min-h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-orange-500 disabled:opacity-60 md:py-2 md:text-sm"
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
            value={manualAlt}
            onChange={(e) => setManualAlt(e.target.value)}
            disabled={busy}
            className="w-full min-h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-orange-500 disabled:opacity-60 md:py-2 md:text-sm"
            placeholder={defaultAlt || productName}
          />
        </div>
        <button
          type="button"
          onClick={handleManualAdd}
          disabled={busy || !manualUrl.trim()}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-orange-500 hover:text-orange-600 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add image
        </button>
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        New uploads are stored on Vercel Blob; existing{" "}
        <code>/products/…</code> paths keep working. Use the arrows to reorder —
        the first image is always the hero image.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={PRODUCT_IMAGE_CONTENT_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
