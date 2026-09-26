import { PrismaClient } from "@prisma/client";

/**
 * Non-destructive catalog sync for the 7 Motoman products.
 *
 * Applies the canonical product data (name, SKU, price, compare-at price,
 * description, SEO fields, categories, variants, images) to an existing
 * database WITHOUT deleting anything — safe to run against live data.
 * Products are matched by slug; variants are matched by their current SKU.
 */

const prisma = new PrismaClient();

type SpecVariant = {
  /** Variant SKUs used before the MOTO-* rename. */
  previousSkus: string[];
  name: string;
  sku: string;
  price: number;
  size: string;
  stock: number;
};

type SpecProduct = {
  slug: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  metaTitle: string;
  metaDescription: string;
  categorySlug: string;
  featured: boolean;
  isNew: boolean;
  tags: string[];
  images: { url: string; alt: string }[];
  variants: SpecVariant[];
};

const PRODUCTS: SpecProduct[] = [
  {
    slug: "motoman-premium-car-shampoo-500ml",
    name: "Motoman Premium Car Shampoo",
    sku: "MOTO-CS-500",
    description:
      "Motoman Premium Car Shampoo 500ml is designed for effective vehicle cleaning with a rich cleaning formula suitable for regular automotive care.\n\nSuitable for:\n- Cars\n- Bikes\n- Scooters",
    price: 340,
    compareAtPrice: 420,
    metaTitle: "Motoman Premium Car Shampoo 500ml | Car Wash Shampoo",
    metaDescription:
      "Buy Motoman Premium Car Shampoo 500ml at ₹340. Premium car wash shampoo for cars, bikes and scooters.",
    categorySlug: "car-wash",
    featured: true,
    isNew: false,
    tags: [
      "car shampoo",
      "car wash shampoo",
      "premium car shampoo",
      "car cleaning shampoo",
      "car shampoo 500ml",
      "automotive shampoo",
      "car cleaning products",
      "bike wash shampoo",
      "car care products",
    ],
    images: [
      { url: "/products/shampoo-1.jpg", alt: "Motoman Premium Car Shampoo 500ml bottle" },
      { url: "/products/shampoo-2.jpg", alt: "Motoman Premium Car Shampoo bottle label close-up" },
      { url: "/products/shampoo-3.jpg", alt: "Motoman Premium Car Shampoo with foam sprayer on a car bonnet" },
      { url: "/products/shampoo-4.jpg", alt: "Motoman Premium Car Shampoo bottle close-up" },
    ],
    variants: [
      { previousSkus: ["MTM-WS-002-500"], name: "500 ml", sku: "MOTO-CS-500", price: 340, size: "500 ml", stock: 120 },
    ],
  },
  {
    slug: "motoman-microfiber-cleaning-gloves",
    name: "Motoman Microfiber Cleaning Gloves",
    sku: "MOTO-MFG-1",
    description:
      "Soft microfiber cleaning gloves designed for convenient car and bike cleaning, detailing and surface care. Available in Pack of 1 and Pack of 2 options.",
    price: 189,
    compareAtPrice: 220,
    metaTitle: "Motoman Microfiber Cleaning Gloves | Car Wash Gloves",
    metaDescription:
      "Buy Motoman microfiber cleaning gloves for car and bike cleaning. Available in pack of 1 and pack of 2.",
    categorySlug: "microfiber",
    featured: false,
    isNew: true,
    tags: [
      "microfiber cleaning gloves",
      "car cleaning gloves",
      "car wash gloves",
      "microfiber car wash glove",
      "car detailing gloves",
      "bike cleaning gloves",
      "automotive cleaning gloves",
    ],
    images: [
      { url: "/products/gloves-1.jpg", alt: "Motoman microfiber cleaning glove in use" },
      { url: "/products/gloves-2.jpg", alt: "Motoman microfiber cleaning gloves holding a foam sprayer" },
      { url: "/products/gloves-3.jpg", alt: "Motoman microfiber cleaning glove texture close-up" },
      { url: "/products/gloves-4.jpg", alt: "Motoman microfiber cleaning gloves pack of 2" },
    ],
    variants: [
      { previousSkus: ["MTM-AC-002-1"], name: "Pack of 1", sku: "MOTO-MFG-1", price: 189, size: "Pack of 1", stock: 110 },
      { previousSkus: ["MTM-AC-002-2P"], name: "Pack of 2", sku: "MOTO-MFG-2", price: 340, size: "Pack of 2", stock: 70 },
    ],
  },
  {
    slug: "motoman-foam-sprayer",
    name: "Motoman Foam Sprayer",
    sku: "MOTO-FS-001",
    description: "Handheld foam sprayer designed for convenient car and bike cleaning.",
    price: 599,
    compareAtPrice: 699,
    metaTitle: "Motoman Foam Sprayer | Car Wash Foam Can",
    metaDescription: "Buy Motoman Foam Sprayer at ₹599. Easy-to-use foam can for car and bike washing.",
    categorySlug: "car-wash",
    featured: true,
    isNew: false,
    tags: [
      "foam sprayer",
      "car foam sprayer",
      "car wash sprayer",
      "manual foam sprayer",
      "car cleaning sprayer",
      "bike wash sprayer",
      "automotive cleaning accessories",
    ],
    images: [
      { url: "/products/sprayer-1.jpg", alt: "Motoman Foam Sprayer on a car bonnet" },
      { url: "/products/sprayer-2.jpg", alt: "Motoman Foam Sprayer close-up with car shampoo on a car bonnet" },
      { url: "/products/sprayer-3.jpg", alt: "Motoman Foam Sprayer in use, handheld" },
      { url: "/products/sprayer-4.jpg", alt: "Motoman Foam Sprayer nozzle close-up" },
    ],
    variants: [
      { previousSkus: ["MTM-WS-001-1"], name: "1 Unit", sku: "MOTO-FS-001", price: 599, size: "1 Unit", stock: 50 },
    ],
  },
  {
    slug: "motoman-1200-gsm-microfiber-cloth",
    name: "Motoman 1200 GSM Premium Microfiber Cloth",
    sku: "MOTO-MF-1200-1",
    description:
      "Motoman 1200 GSM Premium Microfiber Cloth designed for drying, detailing and everyday automotive care. Available as a single cloth or a pack of 2.",
    price: 499,
    compareAtPrice: 599,
    metaTitle: "Motoman 1200 GSM Microfiber Cloth | Car Detailing Towel",
    metaDescription:
      "Shop Motoman 1200 GSM microfiber cloth for car cleaning, drying and detailing. Available in single and pack of 2 options.",
    categorySlug: "microfiber",
    featured: true,
    isNew: false,
    tags: [
      "1200 gsm microfiber cloth",
      "1200 gsm car microfiber cloth",
      "premium microfiber cloth",
      "car drying towel",
      "car detailing microfiber",
      "high gsm microfiber",
      "car cleaning cloth",
      "microfiber towel for car",
    ],
    images: [
      { url: "/products/mf1200-1.jpg", alt: "Motoman 1200 GSM premium microfiber cloth stack" },
      { url: "/products/mf1200-2.jpg", alt: "Motoman 1200 GSM microfiber cloth texture close-up" },
      { url: "/products/mf1200-3.jpg", alt: "Motoman 1200 GSM microfiber cloth folded edge close-up" },
      { url: "/products/mf1200-4.jpg", alt: "Motoman 1200 GSM microfiber cloth pack presentation" },
    ],
    variants: [
      { previousSkus: ["MTM-MF-001-1"], name: "Pack of 1", sku: "MOTO-MF-1200-1", price: 499, size: "Pack of 1", stock: 100 },
      { previousSkus: ["MTM-MF-001-2P"], name: "Pack of 2", sku: "MOTO-MF-1200-2", price: 799, size: "Pack of 2", stock: 60 },
    ],
  },
  {
    slug: "motoman-680-gsm-microfiber-cloth",
    name: "Motoman 680 GSM Microfiber Cloth",
    sku: "MOTO-MF-680-1",
    description:
      "Premium 680 GSM microfiber cloth suitable for car cleaning, detailing, polishing and general automotive care. Available as a single cloth, a set of 2 or a pack of 4.",
    price: 180,
    compareAtPrice: 290,
    metaTitle: "Motoman 680 GSM Microfiber Cloth | Car Cleaning Cloth",
    metaDescription:
      "Buy Motoman 680 GSM microfiber cloth for car cleaning and detailing. Available as single, set of 2 and pack of 4.",
    categorySlug: "microfiber",
    featured: true,
    isNew: true,
    tags: [
      "680 gsm microfiber cloth",
      "680 gsm car cloth",
      "microfiber cloth for car",
      "car detailing cloth",
      "car polishing cloth",
      "premium car microfiber",
      "automotive microfiber towel",
    ],
    images: [
      { url: "/products/mf680-1.jpg", alt: "Motoman 680 GSM microfiber cloth" },
      { url: "/products/mf680-2.jpg", alt: "Motoman 680 GSM microfiber cloth texture close-up" },
      { url: "/products/mf680-3.jpg", alt: "Motoman 680 GSM microfiber cloth in use on a car" },
      { url: "/products/mf680-4.jpg", alt: "Motoman 680 GSM microfiber cloth pack of 4" },
    ],
    variants: [
      { previousSkus: ["MTM-MF-004-1"], name: "Single", sku: "MOTO-MF-680-1", price: 180, size: "Single", stock: 120 },
      { previousSkus: ["MTM-MF-004-2P"], name: "Set of 2", sku: "MOTO-MF-680-2", price: 290, size: "Set of 2", stock: 80 },
      { previousSkus: ["MTM-MF-004-4P"], name: "Pack of 4", sku: "MOTO-MF-680-4", price: 480, size: "Pack of 4", stock: 50 },
    ],
  },
  {
    slug: "motoman-350-gsm-microfiber-cloth-pack-4",
    name: "Motoman 350 GSM Microfiber Cloth",
    sku: "MOTO-MF-350-4",
    description:
      "Everyday microfiber cleaning cloth suitable for automotive cleaning, interior cleaning and general detailing. Pack of 4.",
    price: 320,
    compareAtPrice: null,
    metaTitle: "Motoman 350 GSM Microfiber Cloth Pack of 4",
    metaDescription:
      "Buy Motoman 350 GSM microfiber cloth pack of 4 for car cleaning, detailing and everyday automotive care.",
    categorySlug: "microfiber",
    featured: false,
    isNew: true,
    tags: [
      "350 gsm microfiber cloth",
      "microfiber cloth pack of 4",
      "car cleaning cloth",
      "car microfiber cloth",
      "automotive cleaning cloth",
      "microfiber cloth for detailing",
    ],
    images: [
      { url: "/products/mf350-1.jpg", alt: "Motoman 350 GSM microfiber cloth" },
      { url: "/products/mf350-2.jpg", alt: "Motoman 350 GSM microfiber cloth texture close-up" },
      { url: "/products/mf350-3.jpg", alt: "Motoman 350 GSM microfiber cloth in use" },
      { url: "/products/mf350-4.jpg", alt: "Motoman 350 GSM microfiber cloth pack of 4" },
    ],
    variants: [
      { previousSkus: ["MTM-MF-005-4P"], name: "Pack of 4", sku: "MOTO-MF-350-4", price: 320, size: "Pack of 4", stock: 90 },
    ],
  },
  {
    slug: "motoman-glass-cleaning-microfiber-cloth",
    name: "Motoman Glass Cleaning Microfiber Cloth",
    sku: "MOTO-GLASS-MF-4",
    description:
      "Specialized microfiber cloth designed for streak-free glass and windshield cleaning. Set of 4.",
    price: 399,
    compareAtPrice: null,
    metaTitle: "Motoman Glass Cleaning Microfiber Cloth Set of 4",
    metaDescription:
      "Buy Motoman glass cleaning microfiber cloth set of 4 for car windshield, glass and mirror cleaning.",
    categorySlug: "microfiber",
    featured: false,
    isNew: true,
    tags: [
      "glass cleaning microfiber cloth",
      "glass cleaning cloth",
      "windshield cleaning cloth",
      "car glass cleaning cloth",
      "streak free glass cloth",
      "microfiber glass cloth",
      "car windshield cloth",
    ],
    images: [
      { url: "/products/glass-1.jpg", alt: "Motoman glass cleaning microfiber cloth" },
      { url: "/products/glass-2.jpg", alt: "Motoman glass cleaning microfiber cloth texture close-up" },
      { url: "/products/glass-3.jpg", alt: "Motoman glass cleaning microfiber cloth cleaning a car windshield" },
      { url: "/products/glass-4.jpg", alt: "Motoman glass cleaning microfiber cloth set of 4" },
    ],
    variants: [
      { previousSkus: ["MTM-MF-006-4S"], name: "Set of 4", sku: "MOTO-GLASS-MF-4", price: 399, size: "Set of 4", stock: 75 },
    ],
  },
];

async function sync() {
  const categories = await prisma.category.findMany();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  for (const spec of PRODUCTS) {
    const category = bySlug.get(spec.categorySlug);
    if (!category) throw new Error(`Category not found: ${spec.categorySlug}`);

    const existing = await prisma.product.findUnique({
      where: { slug: spec.slug },
      include: { images: true, variants: true },
    });
    if (!existing) throw new Error(`Product not found: ${spec.slug}`);

    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: spec.name,
        sku: spec.sku,
        description: spec.description,
        price: spec.price,
        compareAtPrice: spec.compareAtPrice,
        metaTitle: spec.metaTitle,
        metaDescription: spec.metaDescription,
        categoryId: category.id,
        featured: spec.featured,
        isNew: spec.isNew,
        brand: "MOTOMAN",
        tags: spec.tags,
        inStock: true,
      },
    });

    // Images — upsert by URL, keep exactly the 4 spec images in order.
    const existingImages = [...existing.images].sort((a, b) => a.sortOrder - b.sortOrder);
    for (let i = 0; i < spec.images.length; i++) {
      const img = spec.images[i];
      const match = existingImages.find((e) => e.url === img.url);
      if (match) {
        await prisma.productImage.update({
          where: { id: match.id },
          data: { alt: img.alt, sortOrder: i },
        });
      } else {
        await prisma.productImage.create({
          data: { productId: existing.id, url: img.url, alt: img.alt, sortOrder: i },
        });
      }
    }
    const keepUrls = spec.images.map((i) => i.url);
    for (const img of existingImages) {
      if (!keepUrls.includes(img.url)) {
        await prisma.productImage.delete({ where: { id: img.id } });
      }
    }

    // Variants — match by current or previous SKU so nothing is duplicated.
    for (const v of spec.variants) {
      const current = await prisma.productVariant.findFirst({
        where: {
          productId: existing.id,
          sku: { in: [v.sku, ...v.previousSkus] },
        },
      });
      if (current) {
        await prisma.productVariant.update({
          where: { id: current.id },
          data: { name: v.name, sku: v.sku, price: v.price, size: v.size, stock: v.stock },
        });
      } else {
        await prisma.productVariant.create({
          data: { productId: existing.id, name: v.name, sku: v.sku, price: v.price, size: v.size, stock: v.stock },
        });
      }
    }
    // Remove variants that belong to this product but are not in the spec.
    const wanted = new Set(spec.variants.flatMap((v) => [v.sku, ...v.previousSkus]));
    for (const v of existing.variants) {
      if (!wanted.has(v.sku)) {
        await prisma.productVariant.delete({ where: { id: v.id } });
      }
    }

    console.log(`synced: ${spec.name}`);
  }

  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  const totalImages = await prisma.productImage.count();
  console.log({ totalProducts, totalVariants, totalImages });
}

sync()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
