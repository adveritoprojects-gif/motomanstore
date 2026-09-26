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
    images: ["sprayer-1.jpg", "sprayer-2.jpg", "sprayer-3.jpg", "sprayer-4.jpg"],
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
  "motoman-glass-cleaning-microfiber-cloth": {
    images: ["glass-1.jpg", "glass-2.jpg", "glass-3.jpg", "glass-4.jpg"],
    title: "Motoman Glass Cleaning Microfiber Cloth Set of 4",
    description:
      "Buy Motoman glass cleaning microfiber cloth set of 4 for car windshield, glass and mirror cleaning.",
    prices: ["399"],
    skus: ["MOTO-GLASS-MF-4"],
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
      if (!Array.isArray(product.image) || product.image.length !== 4)
        fail(`${slug}: JSON-LD images ${Array.isArray(product.image) ? product.image.length : 0} != 4`);
      if (!String(product.url).includes(`/products/${slug}`)) fail(`${slug}: JSON-LD url mismatch`);
      if (!product.sku) fail(`${slug}: JSON-LD sku missing`);
    }

    // 4 gallery images render, all local and distinct
    for (const file of spec.images) {
      if (!html.includes(`products%2F${file}`))
        fail(`${slug}: gallery image ${file} not rendered`);
    }
  }

  // Listing pages
  const shop = await fetch(`${BASE}/shop`, { cache: "no-store" });
  const shopHtml = await shop.text();
  const shopProducts = Object.keys(expected).filter((s) => shopHtml.includes(`/products/${s}`));
  if (shopProducts.length < 7) fail(`/shop lists ${shopProducts.length}/7 products`);

  const cat = await fetch(`${BASE}/categories/microfiber`, { cache: "no-store" });
  const catHtml = await cat.text();
  const catCount = ["motoman-1200-gsm-microfiber-cloth", "motoman-680-gsm-microfiber-cloth",
    "motoman-350-gsm-microfiber-cloth-pack-4", "motoman-microfiber-cleaning-gloves",
    "motoman-glass-cleaning-microfiber-cloth"].filter((s) => catHtml.includes(`/products/${s}`)).length;
  if (catCount < 5) fail(`/categories/microfiber lists ${catCount}/5 products`);

  const home = await fetch(`${BASE}/`, { cache: "no-store" });
  const homeHtml = await home.text();
  if (!homeHtml.includes("/products/motoman-")) fail("homepage has no product links");

  const sitemap = await fetch(`${BASE}/sitemap.xml`, { cache: "no-store" });
  const smXml = await sitemap.text();
  for (const slug of Object.keys(expected)) {
    if (!smXml.includes(`/products/${slug}`)) fail(`sitemap missing ${slug}`);
  }

  const feed = await fetch(`${BASE}/api/google-merchant-feed`, { cache: "no-store" });
  const feedXml = await feed.text();
  const items = (feedXml.match(/<item>/g) || []).length;
  if (items !== 7) fail(`merchant feed has ${items} items != 7`);
  for (const sku of ["MOTO-CS-500", "MOTO-MFG-1", "MOTO-MF-1200-1", "MOTO-GLASS-MF-4"]) {
    if (!feedXml.includes(sku)) fail(`merchant feed missing sku ${sku}`);
  }

  console.log(errors.length ? "FAIL:\n- " + errors.join("\n- ") : "STOREFRONT CHECKS PASSED");
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
