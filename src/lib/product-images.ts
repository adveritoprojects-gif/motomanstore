/**
 * Shared rules for product image uploads (used by both the admin UI and the
 * server-side upload handler). This module must never contain secrets — it is
 * imported by client components.
 */

export const PRODUCT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const PRODUCT_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

const DEFAULT_MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

/** `products/<unique-safe-name>.<ext>` — validated identically on the server. */
const PRODUCT_IMAGE_PATHNAME_PATTERN =
  /^products\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:jpe?g|png|webp|avif|gif)$/;

/** Max upload size in bytes. Configurable via `PRODUCT_IMAGE_MAX_BYTES`. */
export function getMaxProductImageBytes(): number {
  const raw = process.env.PRODUCT_IMAGE_MAX_BYTES;
  if (!raw) return DEFAULT_MAX_PRODUCT_IMAGE_BYTES;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_PRODUCT_IMAGE_BYTES;
  }
  return Math.floor(parsed);
}

export function isAllowedImageContentType(type: string): boolean {
  return (PRODUCT_IMAGE_CONTENT_TYPES as readonly string[]).includes(
    type.toLowerCase()
  );
}

export function isAllowedImageExtension(ext: string): boolean {
  return (PRODUCT_IMAGE_EXTENSIONS as readonly string[]).includes(
    ext.toLowerCase()
  );
}

export function getExtensionForContentType(type: string): string | null {
  return EXTENSION_BY_CONTENT_TYPE[type.toLowerCase()] ?? null;
}

export function getFileExtension(name: string): string {
  const match = /\.[^./\\]+$/.exec(name);
  return match ? match[0].toLowerCase() : "";
}

/** Lowercase, ASCII-safe basename derived from the original file name. */
export function sanitizeFileBaseName(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  const safe = withoutExtension
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .slice(0, 48)
    .replace(/-+$/, "");
  return safe || "image";
}

export type ImageFileCheck = { ok: true } | { ok: false; error: string };

/** Cheap client-side pre-check: MIME type, extension and size. */
export function validateProductImageFile(file: {
  name: string;
  type: string;
  size: number;
  maxBytes?: number;
}): ImageFileCheck {
  const maxBytes = file.maxBytes ?? getMaxProductImageBytes();

  if (!file.size) {
    return { ok: false, error: `"${file.name}" is empty` };
  }
  if (!isAllowedImageContentType(file.type)) {
    return {
      ok: false,
      error: `"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, AVIF or GIF.`,
    };
  }
  const ext = getFileExtension(file.name);
  const expectedExt = getExtensionForContentType(file.type);
  // Extension and MIME type must agree (`.jpg`/`.jpeg` both mean image/jpeg).
  const extensionMatchesType =
    (file.type === "image/jpeg" && (ext === ".jpg" || ext === ".jpeg")) ||
    ext === expectedExt;
  if (!isAllowedImageExtension(ext) || !extensionMatchesType) {
    return {
      ok: false,
      error: `"${file.name}" must be a ${expectedExt ?? "supported"} image file`,
    };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `"${file.name}" is larger than the ${formatBytes(maxBytes)} limit`,
    };
  }
  return { ok: true };
}

/**
 * Verifies the file signature (magic bytes) so a renamed non-image file is
 * rejected before it ever reaches Blob storage.
 */
export async function validateProductImageBytes(
  file: File
): Promise<ImageFileCheck> {
  let header: Uint8Array;
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    header = new Uint8Array(buffer);
  } catch {
    return { ok: false, error: `Could not read "${file.name}"` };
  }

  const ascii = (start: number, end: number) =>
    String.fromCharCode(...header.slice(start, end));

  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng =
    header[0] === 0x89 && ascii(1, 4) === "PNG" && header[4] === 0x0d;
  const isGif = ascii(0, 4) === "GIF8";
  const isWebp = ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  const isAvif = ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));

  if (isJpeg || isPng || isGif || isWebp || isAvif) return { ok: true };
  return {
    ok: false,
    error: `"${file.name}" does not look like a valid image file`,
  };
}

/** Unique, safe Blob pathname for a product image (server-validated too). */
export function buildProductImagePathname(file: {
  name: string;
  type: string;
}): string {
  const extension = getExtensionForContentType(file.type);
  if (!extension) throw new Error("Unsupported image type");
  const unique = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return `products/${unique}-${sanitizeFileBaseName(file.name)}${extension}`;
}

/** Server-side check that an upload pathname matches the expected shape. */
export function isValidProductImagePathname(pathname: string): boolean {
  return PRODUCT_IMAGE_PATHNAME_PATTERN.test(pathname);
}

/**
 * Stored image URLs must be same-origin paths (`/products/...`) or absolute
 * https URLs — blocks things like `javascript:` values reaching `<Image>`.
 */
export function isAllowedImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/") || trimmed.startsWith("https://");
}

/** True when the URL points at Vercel Blob storage (not `public/` files). */
export function isBlobImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "blob.vercel-storage.com" ||
        parsed.hostname.endsWith(".blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
  }
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} bytes`;
}
