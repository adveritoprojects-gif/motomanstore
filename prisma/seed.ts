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
      image: "/category/CarWash.png",
      sortOrder: 1,
    },
  });

  const microfiber = await prisma.category.create({
    data: {
      name: "Microfiber",
      slug: "microfiber",
      description: "Premium cloths, mitts & drying towels",
      image: "/category/Microfiber.png",
      sortOrder: 2,
    },
  });

  const ExteriorCare = await prisma.category.create({
    data: {
      name: "Exterior Care",
      slug: "exterior-care",
      description: "Polish, wax & paint protection",
      image: "/category/exterior.jpg",
      sortOrder: 3,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Buckets, brushes & detailing tools",
      image: "/category/accessories.jpg",
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
          { url: "/products/form-spray.jpeg", alt: "Motoman Foam Sprayer", sortOrder: 0 },
          { url: "/products/sprayer-1.jpg", alt: "Motoman Foam Sprayer on a car bonnet", sortOrder: 1 },
          { url: "/products/sprayer-2.jpg", alt: "Motoman Foam Sprayer with car shampoo on a car bonnet", sortOrder: 2 },
          { url: "/products/sprayer-3.jpg", alt: "Motoman Foam Sprayer in use, handheld", sortOrder: 3 },
          { url: "/products/sprayer-4.jpg", alt: "Motoman Foam Sprayer nozzle close-up", sortOrder: 4 },
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
      name: "Motoman Glass Cleaning Microfiber Cloth — Set of 4",
      slug: "motoman-glass-cleaning-microfiber-cloth-set-of-4",
      sku: "MOTO-GLASS-MF-4",
      description:
        "Keep your automotive glass clean and clear with the Motoman Glass Cleaning Microfiber Cloth Set of 4. Designed for everyday car-care use, these soft microfiber cloths help remove dust, fingerprints, and light dirt from glass surfaces.\n\nKey Features\n- Set of 4 microfiber cloths\n- Soft microfiber texture\n- Helps achieve a streak-free finish\n- Absorbent material\n- Suitable for automotive glass cleaning\n- Useful for cars, bikes, and scooters\n- Reusable and easy to maintain",
      price: 339,
      compareAtPrice: 500,
      metaTitle: "Motoman Glass Cleaning Microfiber Cloth Set of 4 | Motoman Store",
      metaDescription:
        "Shop Motoman Glass Cleaning Microfiber Cloth Set of 4 for automotive glass care. Get the set for ₹339, reduced from ₹500.",
      categoryId: microfiber.id,
      featured: true,
      isNew: false,
      brand: "MOTOMAN",
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
      images: {
        create: [
          {
            url: "/products/glass-cloth-1.jpg",
            alt: "Motoman Glass Cleaning Microfiber Cloth set of 4 folded grey cloths",
            sortOrder: 0,
          },
          {
            url: "/products/glass-cloth-2.jpg",
            alt: "Motoman glass cleaning microfiber cloth wiping a car window",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { name: "Set of 4", sku: "MOTO-GLASS-MF-4", price: 339, stock: 75, size: "Set of 4" },
        ],
      },
    },
    {
      name: "Motoman 350 GSM Microfiber Cloth — Set of 4",
      slug: "motoman-350-gsm-microfiber-cloth-set-of-4",
      sku: "MOTO-MF-350-S4",
      description:
        "Keep your vehicle clean with the Motoman 350 GSM Microfiber Cloth Set of 4. These reusable microfiber cloths are suitable for everyday automotive cleaning and help remove dust, fingerprints, and light dirt from vehicle surfaces.",
      price: 399,
      compareAtPrice: 499,
      metaTitle: "Motoman 350 GSM Microfiber Cloth Set of 4 | Motoman Store",
      metaDescription:
        "Shop the Motoman 350 GSM Microfiber Cloth Set of 4 in red, green, blue and pink. Get four cloths for ₹399, reduced from ₹499.",
      categoryId: microfiber.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "350 gsm microfiber cloth",
        "microfiber cloth set of 4",
        "car cleaning cloth",
        "car microfiber cloth",
        "automotive cleaning cloth",
        "reusable microfiber cloth",
      ],
      images: {
        create: [
          {
            url: "/products/motoman-350gsm-microfiber-set-4.webp",
            alt: "Motoman 350 GSM microfiber cloth set of 4 in red, green, blue and pink",
            sortOrder: 0,
          },
          {
            url: "/products/motoman-350gsm-microfiber-red-cloth.webp",
            alt: "Folded red Motoman 350 GSM microfiber cloth",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { name: "Set of 4", sku: "MOTO-MF-350-S4", price: 399, stock: 80, size: "Set of 4" },
        ],
      },
    },
    {
      name: "Motoman Microfiber Cleaning Gloves — Set of 2",
      slug: "motoman-microfiber-cleaning-gloves-set-of-2",
      sku: "MOTO-MFG-S2",
      description:
        "Make your vehicle-cleaning routine easier with Motoman Microfiber Cleaning Gloves. Their plush chenille microfiber texture helps lift dust and dirt during everyday car washing and cleaning. The glove-style design provides a convenient grip while cleaning vehicle surfaces.",
      price: 329,
      compareAtPrice: 499,
      metaTitle: "Motoman Microfiber Cleaning Gloves Set of 2 | Motoman Store",
      metaDescription:
        "Shop Motoman Microfiber Cleaning Gloves Set of 2 in blue. Two chenille cleaning gloves for ₹329, reduced from ₹499.",
      categoryId: microfiber.id,
      featured: false,
      isNew: true,
      brand: "MOTOMAN",
      tags: [
        "microfiber cleaning gloves",
        "cleaning gloves set of 2",
        "car cleaning gloves",
        "car wash gloves",
        "chenille microfiber glove",
        "blue cleaning gloves",
      ],
      images: {
        create: [
          {
            url: "/products/motoman-microfiber-cleaning-gloves-set-2.webp",
            alt: "Blue Motoman microfiber cleaning glove on a white background",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { name: "Set of 2", sku: "MOTO-MFG-S2", price: 329, stock: 70, size: "Set of 2" },
        ],
      },
    },
    {
      name: "Microfiber Gloves × 2",
      slug: "microfiber-gloves-combo-2",
      sku: "MOTO-CMB-GLV-2",
      description:
        "Two Motoman microfiber cleaning gloves for convenient car and bike cleaning and detailing. 2 piece combo pack.",
      price: 320,
      compareAtPrice: 460,
      metaTitle: "Microfiber Gloves × 2 | Motoman Combo Offer",
      metaDescription:
        "Buy the Motoman Microfiber Gloves 2 piece combo at ₹320 (MRP ₹460). Save ₹140 on two microfiber cleaning gloves.",
      categoryId: microfiber.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
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
      images: {
        create: [
          { url: "/products/gloves-1.jpg", alt: "Microfiber Gloves × 2 combo pack", sortOrder: 0 },
          { url: "/products/gloves-2.jpg", alt: "Microfiber cleaning gloves close-up", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "2 Pieces", sku: "MOTO-CMB-GLV-2", price: 320, stock: 50, size: "2 Pieces" },
        ],
      },
    },
    {
      name: "680 GSM Microfiber Cloth × 2",
      slug: "680-gsm-microfiber-cloth-combo-2",
      sku: "MOTO-CMB-MF680-2",
      description:
        "Two Motoman 680 GSM microfiber cloths for car cleaning, polishing and everyday detailing. 2 piece combo pack.",
      price: 240,
      compareAtPrice: null,
      metaTitle: "680 GSM Microfiber Cloth × 2 | Motoman Combo Offer",
      metaDescription:
        "Buy the Motoman 680 GSM Microfiber Cloth 2 piece combo at ₹240. Two premium microfiber cloths for cleaning and detailing.",
      categoryId: microfiber.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: [
        "combo",
        "combo offer",
        "2 piece combo",
        "680 gsm microfiber cloth",
        "car cleaning cloth",
        "microfiber cloth combo",
        "car detailing cloth",
      ],
      images: {
        create: [
          { url: "/products/mf680-1.jpg", alt: "680 GSM Microfiber Cloth × 2 combo pack", sortOrder: 0 },
          { url: "/products/mf680-3.jpg", alt: "680 GSM microfiber cloth texture close-up", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "2 Pieces", sku: "MOTO-CMB-MF680-2", price: 240, stock: 50, size: "2 Pieces" },
        ],
      },
    },
    {
      name: "680 GSM Microfiber Cloth × 3",
      slug: "680-gsm-microfiber-cloth-combo-3",
      sku: "MOTO-CMB-MF680-3",
      description:
        "Three Motoman 680 GSM microfiber cloths for car cleaning, polishing and drying. 3 piece combo pack.",
      price: 310,
      compareAtPrice: null,
      metaTitle: "680 GSM Microfiber Cloth × 3 | Motoman Combo Offer",
      metaDescription:
        "Buy the Motoman 680 GSM Microfiber Cloth 3 piece combo at ₹310. Three premium microfiber cloths for cleaning and detailing.",
      categoryId: microfiber.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: [
        "combo",
        "combo offer",
        "3 piece combo",
        "680 gsm microfiber cloth",
        "car cleaning cloth",
        "microfiber cloth combo",
        "car detailing cloth",
      ],
      images: {
        create: [
          { url: "/products/mf680-4.jpg", alt: "680 GSM Microfiber Cloth × 3 combo pack", sortOrder: 0 },
          { url: "/products/mf680-2.jpg", alt: "680 GSM microfiber cloth detail", sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: "3 Pieces", sku: "MOTO-CMB-MF680-3", price: 310, stock: 50, size: "3 Pieces" },
        ],
      },
    },
    {
      name: "Complete Car Care Combo",
      slug: "motoman-complete-car-care-combo",
      sku: "MOTO-CMB-CARE",
      description:
        "Foam sprayer, 500 ml shampoo, 1200 GSM cloth, and a blue cleaning glove.",
      price: 1299,
      compareAtPrice: null,
      metaTitle: "Complete Car Care Combo | Motoman Store",
      metaDescription:
        "Motoman Complete Car Care Combo at ₹1,299. Includes a foam sprayer, 500 ml shampoo, 1200 GSM microfiber cloth, and a blue cleaning glove.",
      categoryId: carWash.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["combo", "combo offer", "car care combo", "car shampoo", "foam sprayer"],
      images: {
        create: [
          {
            url: "/products/motoman-complete-car-care-combo.webp",
            alt: "Motoman complete car care combo with foam sprayer, blue shampoo, microfiber cloth, and cleaning glove",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { name: "Combo", sku: "MOTO-CMB-CARE", price: 1299, stock: 40, size: "1 Combo" },
        ],
      },
    },
    {
      name: "Foam Can + Car Shampoo",
      slug: "motoman-foam-can-car-shampoo-combo",
      sku: "MOTO-CMB-FOAM",
      description: "Foam sprayer and 500 ml Premium Car Shampoo.",
      price: 699,
      compareAtPrice: null,
      metaTitle: "Foam Can + Car Shampoo Combo | Motoman Store",
      metaDescription:
        "Motoman Foam Can and Car Shampoo combo at ₹699. Includes a foam sprayer and 500 ml Premium Car Shampoo.",
      categoryId: carWash.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["combo", "combo offer", "foam sprayer", "car shampoo"],
      images: {
        create: [
          {
            url: "/products/motoman-foam-can-shampoo-combo.webp",
            alt: "Motoman foam sprayer and blue Premium Car Shampoo bottle",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { name: "Combo", sku: "MOTO-CMB-FOAM", price: 699, stock: 40, size: "1 Combo" },
        ],
      },
    },
    {
      name: "Car Shampoo + Microfiber Cleaning Kit",
      slug: "motoman-shampoo-microfiber-combo",
      sku: "MOTO-CMB-KIT",
      description:
        "500 ml Premium Car Shampoo, a microfiber cloth, and a blue cleaning glove.",
      price: 599,
      compareAtPrice: null,
      metaTitle: "Car Shampoo + Microfiber Cleaning Kit | Motoman Store",
      metaDescription:
        "Motoman Car Shampoo and Microfiber Cleaning Kit at ₹599. Includes 500 ml shampoo, a microfiber cloth, and a blue cleaning glove.",
      categoryId: carWash.id,
      featured: false,
      isNew: false,
      brand: "MOTOMAN",
      tags: ["combo", "combo offer", "car shampoo", "microfiber cloth", "cleaning glove"],
      images: {
        create: [
          {
            url: "/products/motoman-shampoo-microfiber-combo.webp",
            alt: "Motoman blue shampoo, microfiber cloth, and blue cleaning glove",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          { name: "Combo", sku: "MOTO-CMB-KIT", price: 599, stock: 40, size: "1 Combo" },
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
