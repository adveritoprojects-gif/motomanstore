import { PrismaClient } from "@prisma/client";

/** Validates the storefront catalog against the final Motoman price table. */

const prisma = new PrismaClient();

const SPEC: {
  slug: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  metaTitle: string;
  imageCount?: number;
  hero?: string;
  variants: { name: string; sku: string; price: number; compare?: number }[];
}[] = [
  {
    slug: "motoman-premium-car-shampoo-500ml",
    price: 340,
    compareAtPrice: 420,
    sku: "MOTO-CS-500",
    metaTitle: "Motoman Premium Car Shampoo 500ml | Car Wash Shampoo",
    variants: [{ name: "500 ml", sku: "MOTO-CS-500", price: 340, compare: 420 }],
  },
  {
    slug: "motoman-microfiber-cleaning-gloves",
    price: 189,
    compareAtPrice: 220,
    sku: "MOTO-MFG-1",
    metaTitle: "Motoman Microfiber Cleaning Gloves | Car Wash Gloves",
    variants: [
      { name: "Pack of 1", sku: "MOTO-MFG-1", price: 189, compare: 220 },
      { name: "Pack of 2", sku: "MOTO-MFG-2", price: 340 },
    ],
  },
  {
    slug: "motoman-foam-sprayer",
    price: 599,
    compareAtPrice: 699,
    sku: "MOTO-FS-001",
    metaTitle: "Motoman Foam Sprayer | Car Wash Foam Can",
    imageCount: 5,
    hero: "/products/form-spray.jpeg",
    variants: [{ name: "1 Unit", sku: "MOTO-FS-001", price: 599, compare: 699 }],
  },
  {
    slug: "motoman-1200-gsm-microfiber-cloth",
    price: 499,
    compareAtPrice: 599,
    sku: "MOTO-MF-1200-1",
    metaTitle: "Motoman 1200 GSM Microfiber Cloth | Car Detailing Towel",
    variants: [
      { name: "Pack of 1", sku: "MOTO-MF-1200-1", price: 499, compare: 599 },
      { name: "Pack of 2", sku: "MOTO-MF-1200-2", price: 799 },
    ],
  },
  {
    slug: "motoman-680-gsm-microfiber-cloth",
    price: 180,
    compareAtPrice: 290,
    sku: "MOTO-MF-680-1",
    metaTitle: "Motoman 680 GSM Microfiber Cloth | Car Cleaning Cloth",
    variants: [
      { name: "Single", sku: "MOTO-MF-680-1", price: 180, compare: 290 },
      { name: "Set of 2", sku: "MOTO-MF-680-2", price: 290 },
      { name: "Pack of 4", sku: "MOTO-MF-680-4", price: 480 },
    ],
  },
  {
    slug: "motoman-350-gsm-microfiber-cloth-pack-4",
    price: 320,
    compareAtPrice: null,
    sku: "MOTO-MF-350-4",
    metaTitle: "Motoman 350 GSM Microfiber Cloth Pack of 4",
    variants: [{ name: "Pack of 4", sku: "MOTO-MF-350-4", price: 320 }],
  },
  {
    slug: "motoman-glass-cleaning-microfiber-cloth",
    price: 399,
    compareAtPrice: null,
    sku: "MOTO-GLASS-MF-4",
    metaTitle: "Motoman Glass Cleaning Microfiber Cloth Set of 4",
    variants: [{ name: "Set of 4", sku: "MOTO-GLASS-MF-4", price: 399 }],
  },
];

/** Homepage "Combo Offers" products — full catalog rows tagged "combo". */
const COMBO_SPEC: {
  slug: string;
  price: number;
  compareAtPrice: number | null;
  variantSku: string;
  pieces: string;
}[] = [
  {
    slug: "microfiber-gloves-combo-2",
    price: 320,
    compareAtPrice: 460,
    variantSku: "MOTO-CMB-GLV-2",
    pieces: "2 Pieces",
  },
  {
    slug: "680-gsm-microfiber-cloth-combo-2",
    price: 240,
    compareAtPrice: null,
    variantSku: "MOTO-CMB-MF680-2",
    pieces: "2 Pieces",
  },
  {
    slug: "680-gsm-microfiber-cloth-combo-3",
    price: 310,
    compareAtPrice: null,
    variantSku: "MOTO-CMB-MF680-3",
    pieces: "3 Pieces",
  },
];

const errors: string[] = [];
const check = (ok: boolean, msg: string) => {
  if (!ok) errors.push(msg);
};

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true, variants: true, category: true },
  });

  check(products.length >= 7, `expected at least 7 products, got ${products.length}`);

  for (const spec of COMBO_SPEC) {
    const p = products.find((x) => x.slug === spec.slug);
    if (!p) {
      errors.push(`missing combo product: ${spec.slug}`);
      continue;
    }
    check(p.price === spec.price, `${spec.slug}: price ${p.price} != ${spec.price}`);
    check(
      (p.compareAtPrice ?? null) === spec.compareAtPrice,
      `${spec.slug}: compareAtPrice ${p.compareAtPrice} != ${spec.compareAtPrice}`
    );
    check(p.tags.includes("combo"), `${spec.slug}: missing "combo" tag`);
    check(p.inStock, `${spec.slug}: not in stock`);
    const v = p.variants.find((x) => x.sku === spec.variantSku);
    check(Boolean(v), `${spec.slug}: missing variant ${spec.variantSku}`);
    check(v?.size === spec.pieces, `${spec.slug}: variant size ${v?.size} != ${spec.pieces}`);
    check((v?.stock ?? 0) > 0, `${spec.slug}: variant out of stock`);
  }

  for (const spec of SPEC) {
    const p = products.find((x) => x.slug === spec.slug);
    if (!p) {
      errors.push(`missing product: ${spec.slug}`);
      continue;
    }
    check(p.price === spec.price, `${spec.slug}: price ${p.price} != ${spec.price}`);
    check(
      (p.compareAtPrice ?? null) === spec.compareAtPrice,
      `${spec.slug}: compareAtPrice ${p.compareAtPrice} != ${spec.compareAtPrice}`
    );
    check(p.sku === spec.sku, `${spec.slug}: sku ${p.sku} != ${spec.sku}`);
    check(p.metaTitle === spec.metaTitle, `${spec.slug}: metaTitle mismatch`);
    check(Boolean(p.metaDescription?.trim()), `${spec.slug}: metaDescription empty`);
    const expectedImages = spec.imageCount ?? 4;
    check(p.images.length === expectedImages, `${spec.slug}: ${p.images.length} images != ${expectedImages}`);
    if (spec.hero) {
      const hero = [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
      check(hero?.url === spec.hero, `${spec.slug}: hero ${hero?.url} != ${spec.hero}`);
    }
    check(
      p.images.every((i) => i.url.startsWith("/products/")),
      `${spec.slug}: unexpected image url`
    );

    const vs = [...p.variants].sort((a, b) => a.sku.localeCompare(b.sku));
    const sv = [...spec.variants].sort((a, b) => a.sku.localeCompare(b.sku));
    check(vs.length === sv.length, `${spec.slug}: ${vs.length} variants != ${sv.length}`);
    sv.forEach((v, idx) => {
      const got = vs[idx];
      if (!got) return;
      check(got.name === v.name, `${spec.slug}/${v.sku}: name ${got.name} != ${v.name}`);
      check(got.sku === v.sku, `${spec.slug}: variant sku ${got.sku} != ${v.sku}`);
      check(got.price === v.price, `${spec.slug}/${v.sku}: variant price ${got.price} != ${v.price}`);
      check(got.stock > 0, `${spec.slug}/${v.sku}: out of stock`);
    });
  }

  // Storefront discount rule: compare-at only shown when compare > price.
  const discountRows: string[] = [];
  for (const p of products) {
    for (const v of p.variants) {
      const effective = v.price ?? p.price;
      const showCompare = (p.compareAtPrice ?? 0) > effective;
      const core = SPEC.find((s) => s.slug === p.slug);
      const combo = COMBO_SPEC.find((s) => s.slug === p.slug);
      const shouldCompare = combo
        ? (combo.compareAtPrice ?? 0) > effective
        : core !== undefined &&
          p.compareAtPrice !== null &&
          specCompareFor(core, v.sku) !== undefined;
      check(
        showCompare === shouldCompare,
        `${p.slug}/${v.sku}: compare display ${showCompare} != expected ${shouldCompare} (compare=${p.compareAtPrice}, price=${effective})`
      );
      if (showCompare) {
        discountRows.push(
          `${p.name} | ${v.name} | ₹${p.compareAtPrice} → ₹${effective} (${Math.round(
            (((p.compareAtPrice as number) - effective) / (p.compareAtPrice as number)) * 100
          )}% off)`
        );
      } else {
        discountRows.push(`${p.name} | ${v.name} | ₹${effective}`);
      }
    }
  }

  const totalImages = products.reduce((n, p) => n + p.images.length, 0);
  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);
  console.log("PRICE TABLE (as rendered):");
  discountRows.forEach((r) => console.log("  " + r));
  console.log({ products: products.length, variants: totalVariants, images: totalImages });
  console.log(
    errors.length ? `FAIL (${errors.length}):\n- ` + errors.join("\n- ") : "ALL CHECKS PASSED"
  );
  process.exit(errors.length ? 1 : 0);
}

function specCompareFor(
  spec: (typeof SPEC)[number] | undefined,
  variantSku: string
): number | undefined {
  return spec?.variants.find((v) => v.sku === variantSku)?.compare;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
