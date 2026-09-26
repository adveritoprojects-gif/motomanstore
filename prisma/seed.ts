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

  await prisma.category.create({
    data: {
      name: "Exterior Care",
      slug: "exterior-care",
      description: "Polish, wax & paint protection",
      image: "/categories/exterior.jpg",
      sortOrder: 3,
    },
  });

  await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Buckets, brushes & detailing tools",
      image: "/categories/accessories.jpg",
      sortOrder: 4,
    },
  });

  console.log("Categories seeded.");

  // ─── Collections ────────────────────────────────────

  await prisma.collection.create({
    data: {
      name: "Starter Kit",
      slug: "starter-kit",
      description: "Everything you need to begin your car care journey",
      image: "/collections/starter-kit.jpg",
    },
  });

  await prisma.collection.create({
    data: {
      name: "Pro Series",
      slug: "pro-series",
      description: "Professional-grade products for serious enthusiasts",
      image: "/collections/pro-series.jpg",
    },
  });

  await prisma.collection.create({
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
      name: "Motoman Premium Car Shampoo",
      slug: "motoman-premium-car-shampoo-500ml",
      sku: "MOTO-CS-500",
      description:
        "Motoman Premium Car Shampoo 500ml is designed for effective vehicle cleaning with a rich cleaning formula suitable for regular automotive care.\n\nSuitable for:\n- Cars\n- Bikes\n- Scooters",
      price: 340,
      compareAtPrice: 420,
      metaTitle: "Motoman Premium Car Shampoo 500ml | Car Wash Shampoo",
      metaDescription:
        "Buy Motoman Premium Car Shampoo 500ml at ₹340. Premium car wash shampoo for cars, bikes and scooters.",
      categoryId: carWash.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
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
      images: {
        create: [
          { url: "/products/shampoo-1.jpg", alt: "Motoman Premium Car Shampoo 500ml bottle", sortOrder: 0 },
          { url: "/products/shampoo-2.jpg", alt: "Motoman Premium Car Shampoo bottle label close-up", sortOrder: 1 },
          { url: "/products/shampoo-3.jpg", alt: "Motoman Premium Car Shampoo with foam sprayer on a car bonnet", sortOrder: 2 },
          { url: "/products/shampoo-4.jpg", alt: "Motoman Premium Car Shampoo bottle close-up", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "500 ml", sku: "MOTO-CS-500", price: 340, stock: 120, size: "500 ml" },
        ],
      },
    },
    {
      name: "Motoman Foam Sprayer",
      slug: "motoman-foam-sprayer",
      sku: "MOTO-FS-001",
      description:
        "Handheld foam sprayer designed for convenient car and bike cleaning.",
      price: 599,
      compareAtPrice: 699,
      metaTitle: "Motoman Foam Sprayer | Car Wash Foam Can",
      metaDescription:
        "Buy Motoman Foam Sprayer at ₹599. Easy-to-use foam can for car and bike washing.",
      categoryId: carWash.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
      tags: [
        "foam sprayer",
        "car foam sprayer",
        "car wash sprayer",
        "manual foam sprayer",
        "car cleaning sprayer",
        "bike wash sprayer",
        "automotive cleaning accessories",
      ],
      images: {
        create: [
          { url: "/products/sprayer-1.jpg", alt: "Motoman Foam Sprayer on a car bonnet", sortOrder: 0 },
          { url: "/products/sprayer-2.jpg", alt: "Motoman Foam Sprayer with car shampoo on a car bonnet", sortOrder: 1 },
          { url: "/products/sprayer-3.jpg", alt: "Motoman Foam Sprayer in use, handheld", sortOrder: 2 },
          { url: "/products/sprayer-4.jpg", alt: "Motoman Foam Sprayer nozzle close-up", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "1 Unit", sku: "MOTO-FS-001", price: 599, stock: 50 },
        ],
      },
    },
    {
      name: "Motoman 1200 GSM Premium Microfiber Cloth",
      slug: "motoman-1200-gsm-microfiber-cloth",
      sku: "MOTO-MF-1200-1",
      description:
        "Motoman 1200 GSM Premium Microfiber Cloth designed for drying, detailing and everyday automotive care. Available as a single cloth or a pack of 2.",
      price: 499,
      compareAtPrice: 599,
      metaTitle: "Motoman 1200 GSM Microfiber Cloth | Car Detailing Towel",
      metaDescription:
        "Shop Motoman 1200 GSM microfiber cloth for car cleaning, drying and detailing. Available in single and pack of 2 options.",
      categoryId: microfiber.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
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
      images: {
        create: [
          { url: "/products/mf1200-1.jpg", alt: "Motoman 1200 GSM premium microfiber cloth folded", sortOrder: 0 },
          { url: "/products/mf1200-2.jpg", alt: "Motoman 1200 GSM microfiber cloth texture close-up", sortOrder: 1 },
          { url: "/products/mf1200-3.jpg", alt: "Motoman 1200 GSM microfiber cloth on a marble surface", sortOrder: 2 },
          { url: "/products/mf1200-4.jpg", alt: "Motoman 1200 GSM microfiber cloth pack presentation", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "Pack of 1", sku: "MOTO-MF-1200-1", price: 499, stock: 100, size: "Pack of 1" },
          { name: "Pack of 2", sku: "MOTO-MF-1200-2", price: 799, stock: 60, size: "Pack of 2" },
        ],
      },
    },
    {
      name: "Motoman 680 GSM Microfiber Cloth",
      slug: "motoman-680-gsm-microfiber-cloth",
      sku: "MOTO-MF-680-1",
      description:
        "Premium 680 GSM microfiber cloth suitable for car cleaning, detailing, polishing and general automotive care. Available as a single cloth, a set of 2 or a pack of 4.",
      price: 180,
      compareAtPrice: 290,
      metaTitle: "Motoman 680 GSM Microfiber Cloth | Car Cleaning Cloth",
      metaDescription:
        "Buy Motoman 680 GSM microfiber cloth for car cleaning and detailing. Available as single, set of 2 and pack of 4.",
      categoryId: microfiber.id,
      featured: true,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "680 gsm microfiber cloth",
        "680 gsm car cloth",
        "microfiber cloth for car",
        "car detailing cloth",
        "car polishing cloth",
        "premium car microfiber",
        "automotive microfiber towel",
      ],
      images: {
        create: [
          { url: "/products/mf680-1.jpg", alt: "Motoman 680 GSM microfiber cloth", sortOrder: 0 },
          { url: "/products/mf680-2.jpg", alt: "Motoman 680 GSM microfiber cloth texture close-up", sortOrder: 1 },
          { url: "/products/mf680-3.jpg", alt: "Motoman 680 GSM microfiber cloth in use on a car", sortOrder: 2 },
          { url: "/products/mf680-4.jpg", alt: "Motoman 680 GSM microfiber cloth pack of 4", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "Single", sku: "MOTO-MF-680-1", price: 180, stock: 120, size: "Single" },
          { name: "Set of 2", sku: "MOTO-MF-680-2", price: 290, stock: 80, size: "Set of 2" },
          { name: "Pack of 4", sku: "MOTO-MF-680-4", price: 480, stock: 50, size: "Pack of 4" },
        ],
      },
    },
    {
      name: "Motoman 350 GSM Microfiber Cloth",
      slug: "motoman-350-gsm-microfiber-cloth-pack-4",
      sku: "MOTO-MF-350-4",
      description:
        "Everyday microfiber cleaning cloth suitable for automotive cleaning, interior cleaning and general detailing. Pack of 4.",
      price: 320,
      metaTitle: "Motoman 350 GSM Microfiber Cloth Pack of 4",
      metaDescription:
        "Buy Motoman 350 GSM microfiber cloth pack of 4 for car cleaning, detailing and everyday automotive care.",
      categoryId: microfiber.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "350 gsm microfiber cloth",
        "microfiber cloth pack of 4",
        "car cleaning cloth",
        "car microfiber cloth",
        "automotive cleaning cloth",
        "microfiber cloth for detailing",
      ],
      images: {
        create: [
          { url: "/products/mf350-1.jpg", alt: "Motoman 350 GSM microfiber cloth", sortOrder: 0 },
          { url: "/products/mf350-2.jpg", alt: "Motoman 350 GSM microfiber cloth texture close-up", sortOrder: 1 },
          { url: "/products/mf350-3.jpg", alt: "Motoman 350 GSM microfiber cloth in use", sortOrder: 2 },
          { url: "/products/mf350-4.jpg", alt: "Motoman 350 GSM microfiber cloth pack of 4", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "Pack of 4", sku: "MOTO-MF-350-4", price: 320, stock: 90, size: "Pack of 4" },
        ],
      },
    },
    {
      name: "Motoman Microfiber Cleaning Gloves",
      slug: "motoman-microfiber-cleaning-gloves",
      sku: "MOTO-MFG-1",
      description:
        "Soft microfiber cleaning gloves designed for convenient car and bike cleaning, detailing and surface care. Available in Pack of 1 and Pack of 2 options.",
      price: 189,
      compareAtPrice: 220,
      metaTitle: "Motoman Microfiber Cleaning Gloves | Car Wash Gloves",
      metaDescription:
        "Buy Motoman microfiber cleaning gloves for car and bike cleaning. Available in pack of 1 and pack of 2.",
      categoryId: microfiber.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "microfiber cleaning gloves",
        "car cleaning gloves",
        "car wash gloves",
        "microfiber car wash glove",
        "car detailing gloves",
        "bike cleaning gloves",
        "automotive cleaning gloves",
      ],
      images: {
        create: [
          { url: "/products/gloves-1.jpg", alt: "Motoman microfiber cleaning glove in use", sortOrder: 0 },
          { url: "/products/gloves-2.jpg", alt: "Motoman microfiber cleaning gloves holding a foam sprayer", sortOrder: 1 },
          { url: "/products/gloves-3.jpg", alt: "Motoman microfiber cleaning glove texture close-up", sortOrder: 2 },
          { url: "/products/gloves-4.jpg", alt: "Motoman microfiber cleaning gloves pack of 2", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "Pack of 1", sku: "MOTO-MFG-1", price: 189, stock: 110, size: "Pack of 1" },
          { name: "Pack of 2", sku: "MOTO-MFG-2", price: 340, stock: 70, size: "Pack of 2" },
        ],
      },
    },
    {
      name: "Motoman Glass Cleaning Microfiber Cloth",
      slug: "motoman-glass-cleaning-microfiber-cloth",
      sku: "MOTO-GLASS-MF-4",
      description:
        "Specialized microfiber cloth designed for streak-free glass and windshield cleaning. Set of 4.",
      price: 399,
      metaTitle: "Motoman Glass Cleaning Microfiber Cloth Set of 4",
      metaDescription:
        "Buy Motoman glass cleaning microfiber cloth set of 4 for car windshield, glass and mirror cleaning.",
      categoryId: microfiber.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "glass cleaning microfiber cloth",
        "glass cleaning cloth",
        "windshield cleaning cloth",
        "car glass cleaning cloth",
        "streak free glass cloth",
        "microfiber glass cloth",
        "car windshield cloth",
      ],
      images: {
        create: [
          { url: "/products/glass-1.jpg", alt: "Motoman glass cleaning microfiber cloth", sortOrder: 0 },
          { url: "/products/glass-2.jpg", alt: "Motoman glass cleaning microfiber cloth texture close-up", sortOrder: 1 },
          { url: "/products/glass-3.jpg", alt: "Motoman glass cleaning microfiber cloth cleaning a car windshield", sortOrder: 2 },
          { url: "/products/glass-4.jpg", alt: "Motoman glass cleaning microfiber cloth set of 4", sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { name: "Set of 4", sku: "MOTO-GLASS-MF-4", price: 399, stock: 75, size: "Set of 4" },
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
