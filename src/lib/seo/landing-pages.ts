import type { Metadata } from "next";
import { pageMetadata } from "./metadata";

export interface LandingLink {
  href: string;
  label: string;
}

export interface SeoLandingPage {
  /** URL path, e.g. "/microfiber-cloths" */
  path: string;
  /** Title WITHOUT the "| MOTOMAN" suffix (root template appends it). */
  title: string;
  description: string;
  h1: string;
  overline: string;
  /** Natural intro paragraphs — unique per page, no keyword stuffing. */
  intro: string[];
  /** H2 above the product grid. */
  productsHeading: string;
  /** Category slugs to include (any match). */
  categorySlugs?: string[];
  /** Product tags to include (any match), combined with categories via OR. */
  tags?: string[];
  /** When true, shows all categories + all products (hub page). */
  hub?: boolean;
  /** Internal links section (related categories / landing pages). */
  related: LandingLink[];
}

export const LANDING_PAGES: Record<string, SeoLandingPage> = {
  "car-care-products": {
    path: "/car-care-products",
    title: "Car Care Products Online",
    description:
      "Shop car care products online at MOTOMAN — car cleaning supplies, detailing essentials, microfiber cloths and wash accessories for a cleaner, better-looking car.",
    h1: "Car Care Products Online",
    overline: "Shop",
    intro: [
      "Find everything you need to keep your car looking its best. MOTOMAN car care products cover washing, drying, polishing and paint protection — whether you're doing a quick weekend wash or a full detail.",
      "Browse by category or explore the full range below. Every product is priced clearly, with sizes and pack options available on the product page.",
    ],
    productsHeading: "Shop All Car Care Products",
    hub: true,
    related: [
      { href: "/car-cleaning-products", label: "Car Cleaning Products" },
      { href: "/car-detailing-products", label: "Car Detailing Products" },
      { href: "/microfiber-cloths", label: "Microfiber Cloths" },
      { href: "/shop", label: "All Products" },
    ],
  },
  "car-cleaning-products": {
    path: "/car-cleaning-products",
    title: "Car Cleaning Products Online",
    description:
      "Shop car cleaning products online — shampoos, foam sprayers, wash mitts and microfiber cloths for a thorough, scratch-free clean at MOTOMAN.",
    h1: "Car Cleaning Products",
    overline: "Cleaning",
    intro: [
      "A good wash is the foundation of car care. MOTOMAN car cleaning products — car shampoos, foam sprayers and soft wash tools — lift dirt safely without scratching your paint.",
      "Pair your wash products with microfiber cloths and drying towels for a streak-free finish, then browse exterior care for the rest of your routine.",
    ],
    productsHeading: "Shop Car Cleaning Products",
    categorySlugs: ["car-wash"],
    related: [
      { href: "/categories/car-wash", label: "Car Wash Category" },
      { href: "/microfiber-cloths", label: "Microfiber Cloths" },
      { href: "/car-care-products", label: "All Car Care Products" },
      { href: "/shop", label: "All Products" },
    ],
  },
  "car-detailing-products": {
    path: "/car-detailing-products",
    title: "Car Detailing Products & Supplies Online",
    description:
      "Shop car detailing products online — waxes, sealants, brushes and microfiber towels for a professional finish at MOTOMAN.",
    h1: "Car Detailing Products",
    overline: "Detailing",
    intro: [
      "Detailing is where a clean car becomes a great-looking one. MOTOMAN detailing supplies include paint protection and precision brushes for vents, seams and trim.",
      "Use microfiber towels for polishing and buffing, and finish with a wax or sealant for lasting shine and protection.",
    ],
    productsHeading: "Shop Detailing Supplies",
    categorySlugs: ["exterior-care", "accessories"],
    related: [
      { href: "/exterior-car-cleaning", label: "Exterior Car Cleaning" },
      { href: "/microfiber-cloths", label: "Microfiber Cloths" },
      { href: "/car-care-products", label: "All Car Care Products" },
      { href: "/shop", label: "All Products" },
    ],
  },
  "microfiber-cloths": {
    path: "/microfiber-cloths",
    title: "Microfiber Cloth for Car Cleaning & Detailing",
    description:
      "Shop microfiber cloths for car cleaning, polishing, drying and detailing. Explore soft, absorbent microfiber towels at MOTOMAN.",
    h1: "Microfiber Cloths for Car Cleaning & Detailing",
    overline: "Microfiber",
    intro: [
      "Microfiber is the safe choice for washing, drying and polishing your car. The fine fibers trap dirt and absorb water, so you can clean effectively without swirls or scratches.",
      "MOTOMAN microfiber cloths, wash mitts and drying towels are built for automotive surfaces — paint, glass, chrome and trim — and hold up wash after wash.",
    ],
    productsHeading: "Shop Microfiber Cloths & Towels",
    categorySlugs: ["microfiber"],
    related: [
      { href: "/microfiber-drying-towels", label: "Microfiber Drying Towels" },
      { href: "/car-cleaning-products", label: "Car Cleaning Products" },
      { href: "/categories/microfiber", label: "Microfiber Category" },
      { href: "/car-care-products", label: "All Car Care Products" },
    ],
  },
  "microfiber-drying-towels": {
    path: "/microfiber-drying-towels",
    title: "Microfiber Drying Towel for Car",
    description:
      "Shop microfiber drying towels for cars — highly absorbent car drying towels that cut drying time and help prevent water spots. Available at MOTOMAN.",
    h1: "Microfiber Drying Towels for Cars",
    overline: "Drying",
    intro: [
      "Drying is the last step of every wash, and the right towel makes it faster. A plush microfiber drying towel soaks up water quickly and leaves paint dry and spot-free.",
      "MOTOMAN drying towels and absorbent microfiber cloths stay gentle on paint while handling large panels in fewer passes.",
    ],
    productsHeading: "Shop Drying Towels & Cloths",
    tags: ["drying", "towel"],
    related: [
      { href: "/microfiber-cloths", label: "Microfiber Cloths" },
      { href: "/car-cleaning-products", label: "Car Cleaning Products" },
      { href: "/categories/microfiber", label: "Microfiber Category" },
      { href: "/shop", label: "All Products" },
    ],
  },
  "exterior-car-cleaning": {
    path: "/exterior-car-cleaning",
    title: "Exterior Car Cleaning & Care Products",
    description:
      "Shop exterior car cleaning products — waxes, sealants and wheel cleaners for paint protection and a showroom shine at MOTOMAN.",
    h1: "Exterior Car Cleaning Products",
    overline: "Exterior",
    intro: [
      "Protect what you wash. MOTOMAN exterior care products — carnauba wax, paint sealant and wheel & tyre cleaner — keep paint glossy and wheels free of brake dust and road grime.",
      "Start with a proper wash, dry with a microfiber towel, then add protection for a finish that lasts between washes.",
    ],
    productsHeading: "Shop Exterior Car Care Products",
    categorySlugs: ["exterior-care"],
    related: [
      { href: "/car-detailing-products", label: "Car Detailing Products" },
      { href: "/categories/exterior-care", label: "Exterior Care Category" },
      { href: "/car-cleaning-products", label: "Car Cleaning Products" },
      { href: "/car-care-products", label: "All Car Care Products" },
    ],
  },
};

export function getLandingPage(key: string): SeoLandingPage | undefined {
  return LANDING_PAGES[key];
}

export const LANDING_PAGE_KEYS = Object.keys(LANDING_PAGES);

/** Metadata for a landing page — unique title, description and canonical. */
export function landingMetadata(page: SeoLandingPage): Metadata {
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  });
}
