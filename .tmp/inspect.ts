import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const cats = await p.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  console.log("CATEGORIES:\n  " + cats.map(c => `${c.slug} (${c.name}) products=${c._count.products}`).join("\n  "));
  const prods = await p.product.findMany({ include: { images: true, category: true, variants: true }, orderBy: { createdAt: "asc" } });
  console.log("PRODUCTS:", prods.length);
  for (const pr of prods) {
    console.log(`  slug=${pr.slug} sku=${pr.sku} cat=${pr.category.slug} price=${pr.price} cmp=${pr.compareAtPrice} featured=${pr.featured} isNew=${pr.isNew} inStock=${pr.inStock} imgs=${pr.images.map(i=>i.url).join("|")} variants=${pr.variants.map(v=>`${v.name}:${v.sku}:${v.stock}:${v.price}`).join("|")}`);
  }
  console.log("MATCH cloth/glass:", prods.filter(pr => /cloth|glass/i.test(pr.slug + pr.name)).map(pr=>pr.slug));
}
main().finally(() => p.$disconnect());
