const BASE = process.env.BASE_URL || "http://localhost:3000";

const expected: Record<
  string,
  { title: string; description: string; prices: string[]; skus: string[]; images: string[] }
> = {
  "motoman-premium-car-shampoo-500ml": {
    images: ["shampoo-1.jpg", "shampoo-2.jpg", "shampoo-3.jpg", "shampoo-4.jpg"],
    title: "Motoman Premium Car Shampoo 500ml | Car Wash Shampoo",
    description:
      "Buy Motoman Premium Car Shampoo 500ml at ₹340. Premium car wash shampoo for cars, bikes and scooters.",
    prices: ["420", "340"],
    skus: ["MOTO-CS-500"],
  },
  "motoman-microfiber-cleaning-gloves": {
    images: ["gloves-1.jpg", "gloves-2.jpg", "gloves-3.jpg", "gloves-4.jpg"],
    title: "Motoman Microfiber Cleaning Gloves | Car Wash Gloves",
    description:
      "Buy Motoman microfiber cleaning gloves for car and bike cleaning. Available in pack of 1 and pack of 2.",
    prices: ["220", "189", "340"],
    skus: ["MOTO-MFG-1", "MOTO-MFG-2"],
  },
  "motoman-foam-sprayer": {
    images: ["form-spray.jpeg", "sprayer-1.jpg", "sprayer-2.jpg", "sprayer-3.jpg", "sprayer-4.jpg"],
    title: "Motoman Foam Sprayer | Car Wash Foam Can",
    description: "Buy Motoman Foam Sprayer at ₹599. Easy-to-use foam can for car and bike washing.",
    prices: ["699", "599"],
    skus: ["MOTO-FS-001"],
  },
  "motoman-1200-gsm-microfiber-cloth": {
    images: ["mf1200-1.jpg", "mf1200-2.jpg", "mf1200-3.jpg", "mf1200-4.jpg"],
    title: "Motoman 1200 GSM Microfiber Cloth | Car Detailing Towel",
    description:
      "Shop Motoman 1200 GSM microfiber cloth for car cleaning, drying and detailing. Available in single and pack of 2 options.",
    prices: ["599", "499", "799"],
    skus: ["MOTO-MF-1200-1", "MOTO-MF-1200-2"],
  },
  "motoman-680-gsm-microfiber-cloth": {
    images: ["mf680-1.jpg", "mf680-2.jpg", "mf680-3.jpg", "mf680-4.jpg"],
    title: "Motoman 680 GSM Microfiber Cloth | Car Cleaning Cloth",
    description:
      "Buy Motoman 680 GSM microfiber cloth for car cleaning and detailing. Available as single, set of 2 and pack of 4.",
    prices: ["290", "180", "480"],
    skus: ["MOTO-MF-680-1", "MOTO-MF-680-2", "MOTO-MF-680-4"],
  },
  "motoman-350-gsm-microfiber-cloth-pack-4": {
    images: ["mf350-1.jpg", "mf350-2.jpg", "mf350-3.jpg", "mf350-4.jpg"],
    title: "Motoman 350 GSM Microfiber Cloth Pack of 4",
    description:
      "Buy Motoman 350 GSM microfiber cloth pack of 4 for car cleaning, detailing and everyday automotive care.",
    prices: ["320"],
    skus: ["MOTO-MF-350-4"],
  },
  "motoman-glass-cleaning-microfiber-cloth-set-of-4": {
    images: ["glass-cloth-1.jpg", "glass-cloth-2.jpg"],
    title: "Motoman Glass Cleaning Microfiber Cloth Set of 4 | Motoman Store",
    description:
      "Shop Motoman Glass Cleaning Microfiber Cloth Set of 4 for automotive glass care. Get the set for ₹339, reduced from ₹500.",
    prices: ["500", "339"],
    skus: ["MOTO-GLASS-MF-4"],
  },
  "motoman-350-gsm-microfiber-cloth-set-of-4": {
    images: [
      "motoman-350gsm-microfiber-set-4.webp",
      "motoman-350gsm-microfiber-red-cloth.webp",
    ],
    title: "Motoman 350 GSM Microfiber Cloth Set of 4 | Motoman Store",
    description:
      "Shop the Motoman 350 GSM Microfiber Cloth Set of 4 in red, green, blue and pink. Get four cloths for ₹399, reduced from ₹499.",
    prices: ["499", "399"],
    skus: ["MOTO-MF-350-S4"],
  },
  "motoman-microfiber-cleaning-gloves-set-of-2": {
    images: ["motoman-microfiber-cleaning-gloves-set-2.webp"],
    title: "Motoman Microfiber Cleaning Gloves Set of 2 | Motoman Store",
    description:
      "Shop Motoman Microfiber Cleaning Gloves Set of 2 in blue. Two chenille cleaning gloves for ₹329, reduced from ₹499.",
    prices: ["499", "329"],
    skus: ["MOTO-MFG-S2"],
  },
  "microfiber-gloves-combo-2": {
    images: ["gloves-1.jpg", "gloves-2.jpg"],
    title: "Microfiber Gloves × 2 | Motoman Combo Offer",
    description:
      "Buy the Motoman Microfiber Gloves 2 piece combo at ₹320 (MRP ₹460). Save ₹140 on two microfiber cleaning gloves.",
    prices: ["460", "320"],
    skus: ["MOTO-CMB-GLV-2"],
  },
  "680-gsm-microfiber-cloth-combo-2": {
    images: ["mf680-1.jpg", "mf680-3.jpg"],
    title: "680 GSM Microfiber Cloth × 2 | Motoman Combo Offer",
    description:
      "Buy the Motoman 680 GSM Microfiber Cloth 2 piece combo at ₹240. Two premium microfiber cloths for cleaning and detailing.",
    prices: ["240"],
    skus: ["MOTO-CMB-MF680-2"],
  },
  "680-gsm-microfiber-cloth-combo-3": {
    images: ["mf680-4.jpg", "mf680-2.jpg"],
    title: "680 GSM Microfiber Cloth × 3 | Motoman Combo Offer",
    description:
      "Buy the Motoman 680 GSM Microfiber Cloth 3 piece combo at ₹310. Three premium microfiber cloths for cleaning and detailing.",
    prices: ["310"],
    skus: ["MOTO-CMB-MF680-3"],
  },
  "motoman-complete-car-care-combo": {
    images: ["motoman-complete-car-care-combo.webp"],
    title: "Complete Car Care Combo | Motoman Store",
    description:
      "Motoman Complete Car Care Combo at ₹1,299. Includes a foam sprayer, 500 ml shampoo, 1200 GSM microfiber cloth, and a blue cleaning glove.",
    prices: ["1299"],
    skus: ["MOTO-CMB-CARE"],
  },
  "motoman-foam-can-car-shampoo-combo": {
    images: ["motoman-foam-can-shampoo-combo.webp"],
    title: "Foam Can + Car Shampoo Combo | Motoman Store",
    description:
      "Motoman Foam Can and Car Shampoo combo at ₹699. Includes a foam sprayer and 500 ml Premium Car Shampoo.",
    prices: ["699"],
    skus: ["MOTO-CMB-FOAM"],
  },
  "motoman-shampoo-microfiber-combo": {
    images: ["motoman-shampoo-microfiber-combo.webp"],
    title: "Car Shampoo + Microfiber Cleaning Kit | Motoman Store",
    description:
      "Motoman Car Shampoo and Microfiber Cleaning Kit at ₹599. Includes 500 ml shampoo, a microfiber cloth, and a blue cleaning glove.",
    prices: ["599"],
    skus: ["MOTO-CMB-KIT"],
  },
};

const errors: string[] = [];
const fail = (m: string) => errors.push(m);

type JsonLd = Record<string, unknown> & {
  "@type"?: string;
  offers?: { price?: unknown; priceCurrency?: string; availability?: string };
  image?: unknown;
  url?: string;
  sku?: string;
};

function jsonLdBlocks(html: string): JsonLd[] {
  const out: JsonLd[] = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]) as JsonLd);
    } catch {
      fail("unparseable JSON-LD block");
    }
  }
  return out;
}

/** Match a product URL without treating a longer slug as the shorter one. */
function linksToProduct(html: string, slug: string): boolean {
  return new RegExp(`/products/${slug}(?:["'?<#]|$)`).test(html);
}

async function main() {
  for (const [slug, spec] of Object.entries(expected)) {
    const res = await fetch(`${BASE}/products/${slug}`, { cache: "no-store" });
    if (res.status !== 200) {
      fail(`${slug}: HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();

    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    if (!title.includes(spec.title)) fail(`${slug}: title "${title}" missing "${spec.title}"`);

    if (!html.includes(`<meta name="description" content="${spec.description}"`))
      fail(`${slug}: meta description mismatch`);

    if (!new RegExp(`rel="canonical" href="[^"]*/products/${slug}"`).test(html))
      fail(`${slug}: canonical missing`);

    if (!html.includes(`property="og:image"`)) fail(`${slug}: og:image missing`);

    for (const sku of spec.skus) {
      if (!html.includes(sku)) fail(`${slug}: SKU ${sku} not rendered`);
    }
    for (const price of spec.prices) {
      if (!html.includes(`₹${Number(price).toLocaleString("en-IN")}`) && !html.includes(`"${price}"`))
        fail(`${slug}: price ${price} not found in page`);
    }

    const blocks = jsonLdBlocks(html);
    const product = blocks.find((b) => b["@type"] === "Product");
    if (!product) fail(`${slug}: no Product JSON-LD`);
    else {
      if (product.offers?.priceCurrency !== "INR") fail(`${slug}: currency not INR`);
      if (String(product.offers?.price) !== String(spec.prices[spec.prices.length - 1]) &&
          !spec.prices.includes(String(product.offers?.price)))
        fail(`${slug}: JSON-LD price ${product.offers?.price} unexpected`);
      if (!String(product.offers?.availability).includes("InStock"))
        fail(`${slug}: availability not InStock`);
      const jsonLdImages = Array.isArray(product.image)
        ? product.image
        : product.image
          ? [product.image]
          : [];
      if (jsonLdImages.length !== spec.images.length)
        fail(`${slug}: JSON-LD images ${jsonLdImages.length} != ${spec.images.length}`);
      if (!String(product.url).includes(`/products/${slug}`)) fail(`${slug}: JSON-LD url mismatch`);
      if (!product.sku) fail(`${slug}: JSON-LD sku missing`);
    }

    // gallery images render, all local and distinct
    for (const file of spec.images) {
      if (!html.includes(`products%2F${file}`))
        fail(`${slug}: gallery image ${file} not rendered`);
    }
  }

  // Listing pages
  const shop = await fetch(`${BASE}/shop`, { cache: "no-store" });
  const shopHtml = await shop.text();
  const expectedSlugs = Object.keys(expected);
  const shopProducts = expectedSlugs.filter((s) => linksToProduct(shopHtml, s));
  if (shopProducts.length < expectedSlugs.length)
    fail(`/shop lists ${shopProducts.length}/${expectedSlugs.length} products`);

  const cat = await fetch(`${BASE}/categories/microfiber`, { cache: "no-store" });
  const catHtml = await cat.text();
  const microfiberSlugs = [
    "motoman-1200-gsm-microfiber-cloth",
    "motoman-680-gsm-microfiber-cloth",
    "motoman-350-gsm-microfiber-cloth-pack-4",
    "motoman-350-gsm-microfiber-cloth-set-of-4",
    "motoman-microfiber-cleaning-gloves",
    "motoman-microfiber-cleaning-gloves-set-of-2",
    "motoman-glass-cleaning-microfiber-cloth-set-of-4",
  ];
  const catCount = microfiberSlugs.filter((s) => linksToProduct(catHtml, s)).length;
  if (catCount < microfiberSlugs.length)
    fail(`/categories/microfiber lists ${catCount}/${microfiberSlugs.length} products`);

  const home = await fetch(`${BASE}/`, { cache: "no-store" });
  const homeHtml = await home.text();
  if (!homeHtml.includes("/products/motoman-")) fail("homepage has no product links");

  const sitemap = await fetch(`${BASE}/sitemap.xml`, { cache: "no-store" });
  const smXml = await sitemap.text();
  for (const slug of Object.keys(expected)) {
    if (!linksToProduct(smXml, slug)) fail(`sitemap missing ${slug}`);
  }

  const feed = await fetch(`${BASE}/api/google-merchant-feed`, { cache: "no-store" });
  const feedXml = await feed.text();
  const items = (feedXml.match(/<item>/g) || []).length;
  if (items < expectedSlugs.length) fail(`merchant feed has ${items} items < ${expectedSlugs.length}`);
  for (const sku of ["MOTO-CS-500", "MOTO-MFG-1", "MOTO-MF-1200-1", "MOTO-GLASS-MF-4", "MOTO-MF-350-S4", "MOTO-MFG-S2", "MOTO-CMB-GLV-2"]) {
    if (!feedXml.includes(sku)) fail(`merchant feed missing sku ${sku}`);
  }

  console.log(errors.length ? "FAIL:\n- " + errors.join("\n- ") : "STOREFRONT CHECKS PASSED");
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
