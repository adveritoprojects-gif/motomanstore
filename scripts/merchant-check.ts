/**
 * Google Merchant Center readiness checklist.
 * Run: npm run seo:check
 *
 * Reports missing fields per product so Shopping feed issues are easy to debug.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Row {
  sku: string;
  name: string;
  missing: string[];
}

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "asc" },
  });

  const rows: Row[] = products.map((product) => {
    const missing: string[] = [];
    if (!product.name?.trim()) missing.push("title");
    if (!product.description?.trim()) missing.push("description");
    if (!product.inStock && product.inStock !== false) missing.push("availability");
    if (product.price == null || product.price <= 0) missing.push("price");
    if (!product.brand?.trim()) missing.push("brand");
    if (!product.sku?.trim()) missing.push("sku");
    if (!product.images[0]?.url) missing.push("image");
    if (!product.category?.name) missing.push("product category");
    if (!product.gtin) missing.push("gtin (optional — add when manufacturer provides)");
    if (!product.mpn) missing.push("mpn (optional — add when manufacturer provides)");
    return { sku: product.sku, name: product.name, missing };
  });

  const requiredFields = [
    "title",
    "description",
    "price",
    "brand",
    "sku",
    "image",
    "product category",
    "availability",
  ];

  let issues = 0;
  console.log("\nGoogle Merchant Center readiness checklist");
  console.log("════════════════════════════════════════\n");

  for (const row of rows) {
    const critical = row.missing.filter((f) => requiredFields.includes(f));
    const optional = row.missing.filter((f) => !requiredFields.includes(f));
    if (critical.length === 0 && optional.length === 0) {
      console.log(`✅ ${row.sku}  ${row.name}`);
      continue;
    }
    issues += critical.length;
    const marks = [
      critical.length ? `❌ missing: ${critical.join(", ")}` : null,
      optional.length ? `⚠️  ${optional.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    console.log(`⚠️  ${row.sku}  ${row.name} — ${marks}`);
  }

  console.log(`\n${products.length} products checked, ${issues} required-field issue(s).`);
  if (issues > 0) process.exitCode = 1;

  // GTIN/MPN summary
  const withGtin = products.filter((p) => p.gtin).length;
  const withMpn = products.filter((p) => p.mpn).length;
  console.log(`GTIN present: ${withGtin}/${products.length}`);
  console.log(`MPN present:  ${withMpn}/${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
