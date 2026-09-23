import { getProducts } from "@/lib/queries";
import {
  mapProductToGoogleCategory,
  productTypeLabel,
} from "@/lib/seo/google-categories";
import { productSeoDescription, productSeoTitle } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Google Merchant Center product feed (RSS 2.0 + shopping namespace).
 * Generated dynamically from the product database — scales with new products.
 *
 * Merchant Center setup: Products → Feeds → Add feed (API) →
 *   https://<your-domain>/api/google-merchant-feed
 *
 * gtin / mpn are only emitted when present in the database (never invented).
 */
export async function GET(): Promise<Response> {
  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];

  try {
    products = (await getProducts({ limit: 1000 })).products;
  } catch (error) {
    console.error("Google Merchant feed: failed to load products", error);
    return new Response("Feed unavailable", { status: 503 });
  }

  const items = products
    .map((product) => {
      const link = `${SITE_URL}/products/${product.slug}`;
      const imageUrl = product.images[0]?.url
        ? toAbsoluteUrl(product.images[0].url)
        : "";

      const title = productSeoTitle(product);
      const description = productSeoDescription(product, 5000);
      const googleCategory = mapProductToGoogleCategory(product);
      const productType = productTypeLabel(product);
      const availability = product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
      const price = `${product.price.toFixed(2)} INR`;
      const brand = product.brand?.trim() || "MOTOMAN";

      const lines = [
        "  <item>",
        `    <g:id>${escapeXml(product.id)}</g:id>`,
        `    <g:title>${escapeXml(title)}</g:title>`,
        `    <g:description>${escapeXml(description)}</g:description>`,
        `    <g:link>${escapeXml(link)}</g:link>`,
        ...(imageUrl
          ? [`    <g:image_link>${escapeXml(imageUrl)}</g:image_link>`]
          : []),
        `    <g:availability>${escapeXml(availability)}</g:availability>`,
        `    <g:price>${escapeXml(price)}</g:price>`,
        `    <g:brand>${escapeXml(brand)}</g:brand>`,
        `    <g:condition>new</g:condition>`,
        `    <g:product_type>${escapeXml(productType)}</g:product_type>`,
        `    <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>`,
        `    <g:sku>${escapeXml(product.sku)}</g:sku>`,
        ...(product.gtin
          ? [`    <g:gtin>${escapeXml(product.gtin)}</g:gtin>`]
          : []),
        ...(product.mpn
          ? [`    <g:mpn>${escapeXml(product.mpn)}</g:mpn>`]
          : []),
        `    <link>${escapeXml(link)}</link>`,
        `    <title>${escapeXml(title)}</title>`,
        `    <description>${escapeXml(description)}</description>`,
        "  </item>",
      ];
      return lines.join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MOTOMAN Product Feed</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>MOTOMAN car care and detailing products</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
