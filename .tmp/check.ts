import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const prod = await p.product.findUnique({
    where: { slug: "motoman-glass-cleaning-microfiber-cloth-set-of-4" },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true, category: true },
  });
  console.log(JSON.stringify(prod, null, 2));
  const dupes = await p.product.findMany({ where: { OR: [{ sku: "MOTO-GLASS-MF-4" }, { slug: { contains: "glass" } }] }, select: { slug: true, sku: true, price: true } });
  console.log("glass-related rows:", dupes);
  const cat = await p.product.findMany({ where: { category: { slug: "microfiber" } }, select: { slug: true, price: true, featured: true } });
  console.log("microfiber:", cat);
}
main().finally(() => p.$disconnect());
