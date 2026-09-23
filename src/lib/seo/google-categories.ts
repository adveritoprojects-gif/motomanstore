/**
 * Centralized mapping from store categories/products to Google's official
 * product taxonomy (https://www.google.com/basepages/producttype/taxonomy.en-US.txt).
 * Do not invent paths — extend this file only with verified taxonomy paths.
 */

export const GOOGLE_TAXONOMY = {
  vehicleCleaning:
    "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Cleaning",
  carWashSolutions:
    "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Cleaning > Car Wash Solutions",
  carWashBrushes:
    "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Cleaning > Car Wash Brushes",
  waxesPolishesProtectants:
    "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Cleaning > Vehicle Waxes, Polishes & Protectants",
  vehicleMaintenanceCareDecor:
    "Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor",
  motorVehicleInteriorFittings:
    "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Interior Fittings",
} as const;

/** Default Google product category per store category slug. */
const CATEGORY_TO_GOOGLE: Record<string, string> = {
  "car-wash": GOOGLE_TAXONOMY.carWashSolutions,
  microfiber: GOOGLE_TAXONOMY.vehicleCleaning,
  "interior-care": GOOGLE_TAXONOMY.vehicleCleaning,
  "exterior-care": GOOGLE_TAXONOMY.waxesPolishesProtectants,
  accessories: GOOGLE_TAXONOMY.carWashBrushes,
};

const FALLBACK = GOOGLE_TAXONOMY.vehicleMaintenanceCareDecor;

type CategoryLike = { slug: string };
type TaggedLike = { tags?: string[] };
type SlugLike = { slug: string };

/**
 * Product-level refinement on top of the category default.
 * Uses only real product data (slug/tags) — no keyword guessing.
 */
export function mapProductToGoogleCategory(product: {
  slug: string;
  tags?: string[];
  category: CategoryLike;
}): string {
  const tags = product.tags ?? [];

  if (tags.includes("brushes") || tags.includes("detailing")) {
    if (product.category.slug === "accessories") {
      return GOOGLE_TAXONOMY.carWashBrushes;
    }
  }
  if (tags.includes("wax") || tags.includes("sealant") || tags.includes("paint-protection")) {
    return GOOGLE_TAXONOMY.waxesPolishesProtectants;
  }
  if (tags.includes("shampoo") || tags.includes("foam") || tags.includes("pre-wash")) {
    return GOOGLE_TAXONOMY.carWashSolutions;
  }
  if (
    product.category.slug === "interior-care" &&
    (tags.includes("interior") || tags.includes("leather") || tags.includes("dashboard"))
  ) {
    return GOOGLE_TAXONOMY.vehicleCleaning;
  }

  return CATEGORY_TO_GOOGLE[product.category.slug] ?? FALLBACK;
}

export function mapCategorySlugToGoogleCategory(slug: string): string {
  return CATEGORY_TO_GOOGLE[slug] ?? FALLBACK;
}

/** Store-facing product_type for the feed, e.g. "Car Wash > Car Shampoo". */
export function productTypeLabel(product: {
  category: { name: string };
  tags?: string[];
}): string {
  const primaryTag = product.tags?.[0];
  return primaryTag
    ? `${product.category.name} > ${primaryTag}`
    : product.category.name;
}

export type { TaggedLike, SlugLike };
