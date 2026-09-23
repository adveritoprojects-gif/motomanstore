import { BRAND } from "@/lib/data";
import { SITE_NAME, SITE_URL, absoluteUrl, absoluteImage } from "./site";

type JsonLd = Record<string, unknown>;

/** Organization schema built only from real project data (BRAND). */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(BRAND.logo),
    description: BRAND.description,
    email: BRAND.email,
    telephone: BRAND.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    // sameAs omitted intentionally: FOOTER_LINKS.social are generic platform
    // URLs, not verified MOTOMAN profiles. Add real profiles when available.
  };
}

/** WebSite schema with SearchAction pointing at the shop search. */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Absolute or root-relative URL. Omit for the current page. */
  item?: string;
}

/** BreadcrumbList schema — URLs must match real routes. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      ...(entry.item ? { item: absoluteUrl(entry.item) } : {}),
    })),
  };
}

interface ProductJsonLdInput {
  id: string;
  name: string;
  description: string;
  slug: string;
  sku: string;
  gtin?: string | null;
  mpn?: string | null;
  brand?: string | null;
  price: number;
  inStock: boolean;
  categoryName: string;
  images: { url: string; alt?: string | null }[];
  currency?: string;
}

/**
 * Product structured data from real product rows.
 * - No fake reviews / aggregateRating are ever emitted.
 * - gtin/mpn are only included when present in the database.
 */
export function productJsonLd(input: ProductJsonLdInput): JsonLd {
  const url = absoluteUrl(`/products/${input.slug}`);
  const imageUrls = input.images
    .map((img) => absoluteImage(img.url))
    .filter((u): u is string => Boolean(u));

  const product: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url,
    sku: input.sku,
    category: input.categoryName,
    brand: {
      "@type": "Brand",
      name: input.brand?.trim() || SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      price: input.price,
      priceCurrency: input.currency || "INR",
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (imageUrls.length > 0) {
    product.image = imageUrls.length === 1 ? imageUrls[0] : imageUrls;
  }
  if (input.gtin) product.gtin = input.gtin;
  if (input.mpn) product.mpn = input.mpn;

  return product;
}

/** ItemList of products for category / landing page listings. */
export function itemListJsonLd(options: {
  name: string;
  items: { name: string; slug: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: options.name,
    itemListElement: options.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(`/products/${item.slug}`),
    })),
  };
}
