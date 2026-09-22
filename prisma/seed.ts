import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();

  // ─── Categories ─────────────────────────────────────

  const carWash = await prisma.category.create({
    data: {
      name: "Car Wash",
      slug: "car-wash",
      description: "Shampoos, foams & wash essentials for a spotless clean",
      image: "/categories/car-wash.jpg",
      sortOrder: 1,
    },
  });

  const microfiber = await prisma.category.create({
    data: {
      name: "Microfiber",
      slug: "microfiber",
      description: "Premium cloths, mitts & drying towels",
      image: "/categories/microfiber.jpg",
      sortOrder: 2,
    },
  });

  const interiorCare = await prisma.category.create({
    data: {
      name: "Interior Care",
      slug: "interior-care",
      description: "Dashboard, seat & trim care products",
      image: "/categories/interior.jpg",
      sortOrder: 3,
    },
  });

  const exteriorCare = await prisma.category.create({
    data: {
      name: "Exterior Care",
      slug: "exterior-care",
      description: "Polish, wax & paint protection",
      image: "/categories/exterior.jpg",
      sortOrder: 4,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Buckets, brushes & detailing tools",
      image: "/categories/accessories.jpg",
      sortOrder: 5,
    },
  });

  console.log("Categories seeded.");

  // ─── Collections ────────────────────────────────────

  const starterKit = await prisma.collection.create({
    data: {
      name: "Starter Kit",
      slug: "starter-kit",
      description: "Everything you need to begin your car care journey",
      image: "/collections/starter-kit.jpg",
    },
  });

  const proSeries = await prisma.collection.create({
    data: {
      name: "Pro Series",
      slug: "pro-series",
      description: "Professional-grade products for serious enthusiasts",
      image: "/collections/pro-series.jpg",
    },
  });

  const essentials = await prisma.collection.create({
    data: {
      name: "Essentials",
      slug: "essentials",
      description: "Must-have products for every car owner",
      image: "/collections/essentials.jpg",
    },
  });

  console.log("Collections seeded.");

  // ─── Products ───────────────────────────────────────

  const products = [
    {
      name: "Foam Sprayer Bottle",
      slug: "foam-sprayer-bottle",
      sku: "MTM-WS-001",
      description:
        "High-density foam sprayer for even soap distribution. Produces thick, clinging foam that lifts dirt safely. Built with chemical-resistant seals and a precision nozzle for consistent coverage. Ideal for pre-wash and snow foam applications.",
      price: 799,
      categoryId: carWash.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["foam", "sprayer", "pre-wash", "snow-foam"],
      images: {
        create: [
          { url: "/products/foam-sprayer.jpg", alt: "Foam Sprayer Bottle", sortOrder: 0 },
          { url: "/products/foam-sprayer-2.jpg", alt: "Foam Sprayer Bottle - Side View", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "1L", sku: "MTM-WS-001-1L", price: 799, stock: 50, size: "1L" },
          { name: "2L", sku: "MTM-WS-001-2L", price: 1199, stock: 35, size: "2L" },
        ],
      },
    },
    {
      name: "Car Shampoo",
      slug: "car-shampoo",
      sku: "MTM-WS-002",
      description:
        "pH-neutral car shampoo for a scratch-free wash. Rich-lathering formula that encapsulates dirt particles for safe removal. Concentrated formula — a little goes a long way. Safe on all paint finishes including ceramic coatings.",
      price: 399,
      compareAtPrice: 499,
      categoryId: carWash.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["shampoo", "wash", "ph-neutral", "scratch-free"],
      images: {
        create: [
          { url: "/products/car-shampoo.jpg", alt: "Car Shampoo 500ml", sortOrder: 0 },
          { url: "/products/car-shampoo-2.jpg", alt: "Car Shampoo - Lather Detail", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "250ml", sku: "MTM-WS-002-250", price: 249, stock: 80, size: "250ml" },
          { name: "500ml", sku: "MTM-WS-002-500", price: 399, stock: 120, size: "500ml" },
          { name: "1L", sku: "MTM-WS-002-1L", price: 699, stock: 60, size: "1L" },
        ],
      },
    },
    {
      name: "Microfiber Cloth Pack",
      slug: "microfiber-cloth-pack",
      sku: "MTM-MF-001",
      description:
        "Ultra-absorbent microfiber cloths for streak-free drying. 300GSM premium microfiber with a dual-pile design — one side for drying, one side for polishing. Lint-free and safe on all surfaces including glass and chrome.",
      price: 499,
      categoryId: microfiber.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["microfiber", "cloth", "drying", "polishing"],
      images: {
        create: [
          { url: "/products/microfiber-cloth.jpg", alt: "Microfiber Cloth 3 Pack", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "3 Pack", sku: "MTM-MF-001-3P", price: 499, stock: 100, size: "3 Pack" },
          { name: "6 Pack", sku: "MTM-MF-001-6P", price: 899, stock: 60, size: "6 Pack" },
        ],
      },
    },
    {
      name: "Microfiber Wash Mitt",
      slug: "microfiber-wash-mitt",
      sku: "MTM-MF-002",
      description:
        "Soft microfiber mitt that traps dirt safely within its deep pile fibers. Elastic cuff ensures a secure fit. Machine washable and durable for hundreds of washes. The safe alternative to traditional sponge washing.",
      price: 399,
      categoryId: microfiber.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["wash-mitt", "microfiber", "safe-wash"],
      images: {
        create: [
          { url: "/products/wash-mitt.jpg", alt: "Microfiber Wash Mitt", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "Grey", sku: "MTM-MF-002-GR", price: 399, stock: 70, color: "Grey" },
          { name: "Orange", sku: "MTM-MF-002-OR", price: 399, stock: 70, color: "Orange" },
        ],
      },
    },
    {
      name: "Complete Car Care Kit",
      slug: "complete-car-care-kit",
      sku: "MTM-KIT-001",
      description:
        "Everything you need for a showroom finish in one kit. Includes car shampoo, foam sprayer, microfiber cloths, wash mitt, interior cleaner, and a detailing brush set. Perfect as a gift or for those starting their car care journey.",
      price: 1299,
      compareAtPrice: 1599,
      categoryId: carWash.id,
      collectionId: starterKit.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["kit", "bundle", "gift", "starter"],
      images: {
        create: [
          { url: "/products/care-kit.jpg", alt: "Complete Car Care Kit", sortOrder: 0 },
          { url: "/products/care-kit-2.jpg", alt: "Kit Contents", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "Standard", sku: "MTM-KIT-001-STD", price: 1299, stock: 40 },
          { name: "Pro", sku: "MTM-KIT-001-PRO", price: 1999, stock: 25 },
        ],
      },
    },
    {
      name: "Dashboard & Trim Restorer",
      slug: "dashboard-trim-restorer",
      sku: "MTM-IC-001",
      description:
        "Restores faded dashboards and trim to a like-new finish. UV-resistant formula provides long-lasting protection against cracking and discoloration. Non-greasy matte finish that doesn't attract dust.",
      price: 549,
      categoryId: interiorCare.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: ["interior", "dashboard", "trim", "uv-protection"],
      images: {
        create: [
          { url: "/products/trim-restorer.jpg", alt: "Dashboard & Trim Restorer", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "250ml", sku: "MTM-IC-001-250", price: 549, stock: 45, size: "250ml" },
          { name: "500ml", sku: "MTM-IC-001-500", price: 899, stock: 30, size: "500ml" },
        ],
      },
    },
    {
      name: "Leather Conditioner",
      slug: "leather-conditioner",
      sku: "MTM-IC-002",
      description:
        "Premium leather conditioner that nourishes and protects. Prevents cracking, fading, and premature aging. Infused with natural oils for a soft, supple feel. Works on all leather types including aniline and semi-aniline.",
      price: 699,
      categoryId: interiorCare.id,
      collectionId: essentials.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["leather", "conditioner", "interior", "protection"],
      images: {
        create: [
          { url: "/products/leather-conditioner.jpg", alt: "Leather Conditioner", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "200ml", sku: "MTM-IC-002-200", price: 699, stock: 55, size: "200ml" },
        ],
      },
    },
    {
      name: "Carnauba Wax",
      slug: "carnauba-wax",
      sku: "MTM-EC-001",
      description:
        "Brazilian carnauba wax for a deep, warm glow. Provides 3-6 months of hydrophobic protection. Hand-burnished formula for easy application and effortless buffing. The gold standard in paint protection.",
      price: 899,
      compareAtPrice: 1099,
      categoryId: exteriorCare.id,
      collectionId: proSeries.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["wax", "carnauba", "paint-protection", "shine"],
      images: {
        create: [
          { url: "/products/carnauba-wax.jpg", alt: "Carnauba Wax", sortOrder: 0 },
          { url: "/products/carnauba-wax-2.jpg", alt: "Wax Application", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "200g", sku: "MTM-EC-001-200", price: 899, stock: 40, size: "200g" },
          { name: "400g", sku: "MTM-EC-001-400", price: 1499, stock: 20, size: "400g" },
        ],
      },
    },
    {
      name: "Paint Sealant",
      slug: "paint-sealant",
      sku: "MTM-EC-002",
      description:
        "Synthetic paint sealant for extended protection. Lasts up to 12 months with proper maintenance. Creates a sacrificial barrier against UV rays, acid rain, and industrial fallout. Easy wipe-on, buff-off application.",
      price: 749,
      categoryId: exteriorCare.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: ["sealant", "paint-protection", "long-lasting"],
      images: {
        create: [
          { url: "/products/paint-sealant.jpg", alt: "Paint Sealant", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "250ml", sku: "MTM-EC-002-250", price: 749, stock: 50, size: "250ml" },
        ],
      },
    },
    {
      name: "Wheel & Tyre Cleaner",
      slug: "wheel-tyre-cleaner",
      sku: "MTM-EC-003",
      description:
        "Heavy-duty wheel and tyre cleaner that dissolves brake dust, road grime, and stubborn deposits. Colour-changing formula indicates when it's working. Safe on all wheel finishes including chrome, alloy, and painted.",
      price: 449,
      categoryId: exteriorCare.id,
      collectionId: essentials.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["wheel", "tyre", "cleaner", "brake-dust"],
      images: {
        create: [
          { url: "/products/wheel-cleaner.jpg", alt: "Wheel & Tyre Cleaner", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "500ml", sku: "MTM-EC-003-500", price: 449, stock: 65, size: "500ml" },
          { name: "1L", sku: "MTM-EC-003-1L", price: 749, stock: 40, size: "1L" },
        ],
      },
    },
    {
      name: "Detailing Brush Set",
      slug: "detailing-brush-set",
      sku: "MTM-AC-001",
      description:
        "Professional detailing brush set for intricate cleaning. Includes 5 brushes in varying sizes for vents, badges, seams, and tight spaces. Soft boar's bristle tips won't scratch surfaces. Ergonomic handles for extended use.",
      price: 599,
      categoryId: accessories.id,
      collectionId: starterKit.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["brushes", "detailing", "interior", "accessories"],
      images: {
        create: [
          { url: "/products/brush-set.jpg", alt: "Detailing Brush Set", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "5 Piece Set", sku: "MTM-AC-001-5P", price: 599, stock: 55 },
        ],
      },
    },
    {
      name: "Microfibre Drying Towel",
      slug: "microfibre-drying-towel",
      sku: "MTM-MF-003",
      description:
        "Giant 90x60cm microfibre drying towel with twisted-loop technology. Absorbs up to 10x its weight in water. Eliminates water spots and reduces drying time by half. Edged with soft piping to prevent scratches.",
      price: 699,
      categoryId: microfiber.id,
      collectionId: essentials.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["drying", "towel", "microfiber", "large"],
      images: {
        create: [
          { url: "/products/drying-towel.jpg", alt: "Microfibre Drying Towel", sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: "Grey", sku: "MTM-MF-003-GR", price: 699, stock: 45, color: "Grey" },
          { name: "Orange", sku: "MTM-MF-003-OR", price: 699, stock: 45, color: "Orange" },
        ],
      },
    },
  ];

  for (const productData of products) {
    const { images, variants, ...productFields } = productData;
    await prisma.product.create({
      data: {
        ...productFields,
        images: images,
        variants: variants,
      },
    });
  }

  console.log(`${products.length} products seeded.`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
