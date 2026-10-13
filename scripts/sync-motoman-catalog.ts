import { PrismaClient } from "@prisma/client";

/**
 * Non-destructive catalog sync for the Motoman products (core catalog +
 * combo offers).
 *
 * Applies the canonical product data (name, SKU, price, compare-at price,
 * description, SEO fields, categories, variants, images) to an existing
 * database WITHOUT deleting anything — safe to run against live data.
 * Products are matched by slug (missing ones are created); variants are
 * matched by their current SKU.
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
      { url: "/products/form-spray.jpeg", alt: "Motoman Foam Sprayer" },
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
    slug: "motoman-glass-cleaning-microfiber-cloth-set-of-4",
    name: "Motoman Glass Cleaning Microfiber Cloth — Set of 4",
    sku: "MOTO-GLASS-MF-4",
    description:
      "Keep your automotive glass clean and clear with the Motoman Glass Cleaning Microfiber Cloth Set of 4. Designed for everyday car-care use, these soft microfiber cloths help remove dust, fingerprints, and light dirt from glass surfaces.\n\nKey Features\n- Set of 4 microfiber cloths\n- Soft microfiber texture\n- Helps achieve a streak-free finish\n- Absorbent material\n- Suitable for automotive glass cleaning\n- Useful for cars, bikes, and scooters\n- Reusable and easy to maintain",
    price: 339,
    compareAtPrice: 500,
    metaTitle: "Motoman Glass Cleaning Microfiber Cloth Set of 4 | Motoman Store",
    metaDescription:
      "Shop Motoman Glass Cleaning Microfiber Cloth Set of 4 for automotive glass care. Get the set for ₹339, reduced from ₹500.",
    categorySlug: "microfiber",
    featured: true,
    isNew: false,
    tags: [
      "glass cleaning microfiber cloth",
      "glass cleaning cloth",
      "microfiber cloth set of 4",
      "car glass cleaning cloth",
      "windshield cleaning cloth",
      "streak free glass cloth",
      "microfiber glass cloth",
      "car cleaning cloth",
      "microfiber cloth for car",
      "bike glass cleaning cloth",
    ],
    images: [
      { url: "/products/glass-cloth-1.jpg", alt: "Motoman Glass Cleaning Microfiber Cloth set of 4 folded grey cloths" },
      { url: "/products/glass-cloth-2.jpg", alt: "Motoman glass cleaning microfiber cloth wiping a car window" },
    ],
    variants: [
      { previousSkus: ["MTM-MF-006-4S"], name: "Set of 4", sku: "MOTO-GLASS-MF-4", price: 339, size: "Set of 4", stock: 75 },
    ],
  },
  {
    slug: "motoman-350-gsm-microfiber-cloth-set-of-4",
    name: "Motoman 350 GSM Microfiber Cloth — Set of 4",
    sku: "MOTO-MF-350-S4",
    description:
      "Keep your vehicle clean with the Motoman 350 GSM Microfiber Cloth Set of 4. These reusable microfiber cloths are suitable for everyday automotive cleaning and help remove dust, fingerprints, and light dirt from vehicle surfaces.",
    price: 399,
    compareAtPrice: 499,
    metaTitle: "Motoman 350 GSM Microfiber Cloth Set of 4 | Motoman Store",
    metaDescription:
      "Shop the Motoman 350 GSM Microfiber Cloth Set of 4 in red, green, blue and pink. Get four cloths for ₹399, reduced from ₹499.",
    categorySlug: "microfiber",
    featured: false,
    isNew: true,
    tags: [
      "350 gsm microfiber cloth",
      "microfiber cloth set of 4",
      "car cleaning cloth",
      "car microfiber cloth",
      "automotive cleaning cloth",
      "reusable microfiber cloth",
    ],
    images: [
      {
        url: "/products/motoman-350gsm-microfiber-set-4.webp",
        alt: "Motoman 350 GSM microfiber cloth set of 4 in red, green, blue and pink",
      },
      {
        url: "/products/motoman-350gsm-microfiber-red-cloth.webp",
        alt: "Folded red Motoman 350 GSM microfiber cloth",
      },
    ],
    variants: [
      {
        previousSkus: [],
        name: "Set of 4",
        sku: "MOTO-MF-350-S4",
        price: 399,
        size: "Set of 4",
        stock: 80,
      },
    ],
  },
  {
    slug: "motoman-microfiber-cleaning-gloves-set-of-2",
    name: "Motoman Microfiber Cleaning Gloves — Set of 2",
    sku: "MOTO-MFG-S2",
    description:
      "Make your vehicle-cleaning routine easier with Motoman Microfiber Cleaning Gloves. Their plush chenille microfiber texture helps lift dust and dirt during everyday car washing and cleaning. The glove-style design provides a convenient grip while cleaning vehicle surfaces.",
    price: 329,
    compareAtPrice: 499,
    metaTitle: "Motoman Microfiber Cleaning Gloves Set of 2 | Motoman Store",
    metaDescription:
      "Shop Motoman Microfiber Cleaning Gloves Set of 2 in blue. Two chenille cleaning gloves for ₹329, reduced from ₹499.",
    categorySlug: "microfiber",
    featured: false,
    isNew: true,
    tags: [
      "microfiber cleaning gloves",
      "cleaning gloves set of 2",
      "car cleaning gloves",
      "car wash gloves",
      "chenille microfiber glove",
      "cleaning gloves",
    ],
    images: [
      {
        url: "/products/motoman-microfiber-cleaning-gloves-set-2.webp",
        alt: "Blue Motoman microfiber cleaning glove on a white background",
      },
    ],
    variants: [
      {
        previousSkus: [],
        name: "Set of 2",
        sku: "MOTO-MFG-S2",
        price: 329,
        size: "Set of 2",
        stock: 70,
      },
    ],
  },
  {
    slug: "microfiber-gloves-combo-2",
    name: "Microfiber Gloves × 2",
    sku: "MOTO-CMB-GLV-2",
    description:
      "Two Motoman microfiber cleaning gloves for convenient car and bike cleaning and detailing. 2 piece combo pack.",
    price: 320,
    compareAtPrice: 460,
    metaTitle: "Microfiber Gloves × 2 | Motoman Combo Offer",
    metaDescription:
      "Buy the Motoman Microfiber Gloves 2 piece combo at ₹320 (MRP ₹460). Save ₹140 on two microfiber cleaning gloves.",
    categorySlug: "microfiber",
    featured: false,
    isNew: false,
    tags: [
      "combo",
      "combo offer",
      "2 piece combo",
      "microfiber cleaning gloves",
      "car cleaning gloves",
      "car wash gloves",
      "car detailing gloves",
      "microfiber gloves combo",
    ],
    images: [
      { url: "/products/gloves-1.jpg", alt: "Microfiber Gloves × 2 combo pack" },
      { url: "/products/gloves-2.jpg", alt: "Microfiber cleaning gloves close-up" },
    ],
    variants: [
      { previousSkus: [], name: "2 Pieces", sku: "MOTO-CMB-GLV-2", price: 320, size: "2 Pieces", stock: 50 },
    ],
  },
  {
    slug: "680-gsm-microfiber-cloth-combo-2",
    name: "680 GSM Microfiber Cloth × 2",
    sku: "MOTO-CMB-MF680-2",
    description:
      "Two Motoman 680 GSM microfiber cloths for car cleaning, polishing and everyday detailing. 2 piece combo pack.",
    price: 240,
    compareAtPrice: null,
    metaTitle: "680 GSM Microfiber Cloth × 2 | Motoman Combo Offer",
    metaDescription:
      "Buy the Motoman 680 GSM Microfiber Cloth 2 piece combo at ₹240. Two premium microfiber cloths for cleaning and detailing.",
    categorySlug: "microfiber",
    featured: false,
    isNew: false,
    tags: [
      "combo",
      "combo offer",
      "2 piece combo",
      "680 gsm microfiber cloth",
      "car cleaning cloth",
      "microfiber cloth combo",
      "car detailing cloth",
    ],
    images: [
      { url: "/products/mf680-1.jpg", alt: "680 GSM Microfiber Cloth × 2 combo pack" },
      { url: "/products/mf680-3.jpg", alt: "680 GSM microfiber cloth texture close-up" },
    ],
    variants: [
      { previousSkus: [], name: "2 Pieces", sku: "MOTO-CMB-MF680-2", price: 240, size: "2 Pieces", stock: 50 },
    ],
  },
  {
    slug: "680-gsm-microfiber-cloth-combo-3",
    name: "680 GSM Microfiber Cloth × 3",
    sku: "MOTO-CMB-MF680-3",
    description:
      "Three Motoman 680 GSM microfiber cloths for car cleaning, polishing and drying. 3 piece combo pack.",
    price: 310,
    compareAtPrice: null,
    metaTitle: "680 GSM Microfiber Cloth × 3 | Motoman Combo Offer",
    metaDescription:
      "Buy the Motoman 680 GSM Microfiber Cloth 3 piece combo at ₹310. Three premium microfiber cloths for cleaning and detailing.",
    categorySlug: "microfiber",
    featured: false,
    isNew: false,
    tags: [
      "combo",
      "combo offer",
      "3 piece combo",
      "680 gsm microfiber cloth",
      "car cleaning cloth",
      "microfiber cloth combo",
      "car detailing cloth",
    ],
    images: [
      { url: "/products/mf680-4.jpg", alt: "680 GSM Microfiber Cloth × 3 combo pack" },
      { url: "/products/mf680-2.jpg", alt: "680 GSM microfiber cloth detail" },
    ],
    variants: [
      { previousSkus: [], name: "3 Pieces", sku: "MOTO-CMB-MF680-3", price: 310, size: "3 Pieces", stock: 50 },
    ],
  },
  {
    slug: "motoman-complete-car-care-combo",
    name: "Complete Car Care Combo",
    sku: "MOTO-CMB-CARE",
    description:
      "Foam sprayer, 500 ml shampoo, 1200 GSM cloth, and a cleaning glove.",
    price: 1299,
    compareAtPrice: null,
    metaTitle: "Complete Car Care Combo | Motoman Store",
    metaDescription:
      "Motoman Complete Car Care Combo at ₹1,299. Includes a foam sprayer, 500 ml shampoo, 1200 GSM microfiber cloth, and a cleaning glove.",
    categorySlug: "car-wash",
    featured: false,
    isNew: false,
    tags: ["combo", "combo offer", "car care combo", "car shampoo", "foam sprayer"],
    images: [
      {
        url: "/products/motoman-complete-car-care-combo.webp",
        alt: "Motoman complete car care combo with foam sprayer, blue shampoo, microfiber cloth, and cleaning glove",
      },
    ],
    variants: [
      { previousSkus: [], name: "Combo", sku: "MOTO-CMB-CARE", price: 1299, size: "1 Combo", stock: 40 },
    ],
  },
  {
    slug: "motoman-foam-can-car-shampoo-combo",
    name: "Foam Can + Car Shampoo",
    sku: "MOTO-CMB-FOAM",
    description: "Foam sprayer and 500 ml Premium Car Shampoo.",
    price: 699,
    compareAtPrice: null,
    metaTitle: "Foam Can + Car Shampoo Combo | Motoman Store",
    metaDescription:
      "Motoman Foam Can and Car Shampoo combo at ₹699. Includes a foam sprayer and 500 ml Premium Car Shampoo.",
    categorySlug: "car-wash",
    featured: false,
    isNew: false,
    tags: ["combo", "combo offer", "foam sprayer", "car shampoo"],
    images: [
      {
        url: "/products/motoman-foam-can-shampoo-combo.webp",
        alt: "Motoman foam sprayer and blue Premium Car Shampoo bottle",
      },
    ],
    variants: [
      { previousSkus: [], name: "Combo", sku: "MOTO-CMB-FOAM", price: 699, size: "1 Combo", stock: 40 },
    ],
  },
  {
    slug: "motoman-shampoo-microfiber-combo",
    name: "Car Shampoo + Microfiber Cleaning Kit",
    sku: "MOTO-CMB-KIT",
    description:
      "500 ml Premium Car Shampoo, a microfiber cloth, and a cleaning glove.",
    price: 599,
    compareAtPrice: null,
    metaTitle: "Car Shampoo + Microfiber Cleaning Kit | Motoman Store",
    metaDescription:
      "Motoman Car Shampoo and Microfiber Cleaning Kit at ₹599. Includes 500 ml shampoo, a microfiber cloth, and a cleaning glove.",
    categorySlug: "car-wash",
    featured: false,
    isNew: false,
    tags: ["combo", "combo offer", "car shampoo", "microfiber cloth", "cleaning glove"],
    images: [
      {
        url: "/products/motoman-shampoo-microfiber-combo.webp",
        alt: "Motoman blue shampoo, microfiber cloth, and cleaning glove",
      },
    ],
    variants: [
      { previousSkus: [], name: "Combo", sku: "MOTO-CMB-KIT", price: 599, size: "1 Combo", stock: 40 },
    ],
  },
];

async function sync() {
  const categories = await prisma.category.findMany();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  // `--only=<slug>` syncs a single product (used to add/update one product
  // without re-applying the rest of the catalog).
  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.slice("--only=".length);
  const specs = only ? PRODUCTS.filter((p) => p.slug === only) : PRODUCTS;
  if (only && specs.length === 0) {
    throw new Error(`No product in the catalog matches slug: ${only}`);
  }

  for (const spec of specs) {
    const category = bySlug.get(spec.categorySlug);
    if (!category) throw new Error(`Category not found: ${spec.categorySlug}`);

    const existing = await prisma.product.findUnique({
      where: { slug: spec.slug },
      include: { images: true, variants: true },
    });

    const product =
      existing ??
      (await prisma.product.create({
        data: {
          slug: spec.slug,
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
        include: { images: true, variants: true },
      }));

    await prisma.product.update({
      where: { id: product.id },
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

    // Images — upsert by URL, keep exactly the spec images in order.
    const existingImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
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
          data: { productId: product.id, url: img.url, alt: img.alt, sortOrder: i },
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
          productId: product.id,
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
          data: { productId: product.id, name: v.name, sku: v.sku, price: v.price, size: v.size, stock: v.stock },
        });
      }
    }
    // Remove variants that belong to this product but are not in the spec.
    const wanted = new Set(spec.variants.flatMap((v) => [v.sku, ...v.previousSkus]));
    for (const v of product.variants) {
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
