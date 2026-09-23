import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path relative to site root, e.g. "/microfiber-cloths" */
  path: string;
  image?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  /**
   * Full title including any suffix. Required for pages in the root segment
   * (e.g. `/`) because Next's title template only applies to child segments.
   */
  absoluteTitle?: string;
}

/**
 * Builds complete page metadata (title, description, canonical, OG, Twitter)
 * from a single source so every page stays consistent and unique.
 * Plain titles do NOT include the "| MOTOMAN" suffix — the root layout
 * template appends it for child segments.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  robots,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle || `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path === "/" ? SITE_URL : path },
    ...(robots ? { robots } : {}),
    openGraph: {
      type,
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      // Only set images when a real image is provided; otherwise the
      // app/opengraph-image.tsx file convention supplies the default.
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

// ─── Product title / description generators ─────────────────────
// Priority: brand + product type + primary use.
// Only uses data that exists on the product (name, brand, category).
// No invented specs (GSM, sizes, etc.).

const USE_PHRASE_BY_CATEGORY: Record<string, string> = {
  "car-wash": "Car Washing",
  microfiber: "Car Cleaning & Detailing",
  "interior-care": "Interior Car Cleaning",
  "exterior-care": "Exterior Car Care",
  accessories: "Car Detailing",
};

type TitleProduct = {
  name: string;
  brand?: string | null;
  category: { slug: string; name: string };
};

/** Descriptive, natural product title — e.g. "MOTOMAN Microfiber Cloth Pack for Car Cleaning & Detailing". */
export function productSeoTitle(product: TitleProduct): string {
  const brand = product.brand?.trim() || SITE_NAME;
  const hasBrand = product.name
    .toLowerCase()
    .includes(brand.toLowerCase());
  const base = hasBrand ? product.name : `${brand} ${product.name}`;
  const use = USE_PHRASE_BY_CATEGORY[product.category.slug];
  const title = use && !base.toLowerCase().includes(use.toLowerCase())
    ? `${base} for ${use}`
    : base;
  return truncate(title, 70);
}

type DescriptionProduct = {
  name: string;
  brand?: string | null;
  description: string;
  category: { slug: string; name: string };
};

/** Meta description from the real product description — never invents claims. */
export function productSeoDescription(
  product: DescriptionProduct,
  max = 155
): string {
  const raw = product.description.replace(/\s+/g, " ").trim();
  if (raw.length >= 70) return truncate(raw, max);
  const brand = product.brand?.trim() || SITE_NAME;
  return truncate(
    `${raw} Shop ${brand} ${product.category.name.toLowerCase()} products online.`,
    max
  );
}
