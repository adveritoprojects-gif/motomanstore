export const BRAND = {
  logo: "/logo.png",
  name: "MOTOMAN",
  tagline: "PREMIUM CAR CARE",
  slogan: "Drive Cleaner. Drive Better.",
  description:
    "Professional car care products designed for a cleaner, shinier and longer-lasting drive.",
  email: "motoman@gmail.com",
  phone: "+91 89431 76189",
  address: "Payyannur, Kannur, Kerala , India",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Car Care" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export interface LegacyProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  badge?: string;
}

export const PRODUCTS: LegacyProduct[] = [
  {
    id: "1",
    name: "Motoman Premium Car Shampoo",
    slug: "motoman-premium-car-shampoo-500ml",
    description:
      "Motoman Premium Car Shampoo 500ml is designed for effective vehicle cleaning with a rich cleaning formula suitable for regular automotive care.",
    price: 340,
    compareAtPrice: 420,
    image: "/products/shampoo-1.jpg",
    category: "car-wash",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Motoman Foam Sprayer",
    slug: "motoman-foam-sprayer",
    description:
      "Handheld foam sprayer designed for convenient car and bike cleaning.",
    price: 599,
    compareAtPrice: 699,
    image: "/products/form-spray.jpeg",
    category: "car-wash",
  },
  {
    id: "3",
    name: "Motoman 1200 GSM Premium Microfiber Cloth",
    slug: "motoman-1200-gsm-microfiber-cloth",
    description:
      "Motoman 1200 GSM Premium Microfiber Cloth designed for drying, detailing and everyday automotive care.",
    price: 499,
    compareAtPrice: 599,
    image: "/products/mf1200-1.jpg",
    category: "microfiber",
  },
  {
    id: "4",
    name: "Motoman 680 GSM Microfiber Cloth",
    slug: "motoman-680-gsm-microfiber-cloth",
    description:
      "Premium 680 GSM microfiber cloth suitable for car cleaning, detailing, polishing and general automotive care.",
    price: 180,
    compareAtPrice: 290,
    image: "/products/mf680-1.jpg",
    category: "microfiber",
  },
  {
    id: "5",
    name: "Motoman 350 GSM Microfiber Cloth",
    slug: "motoman-350-gsm-microfiber-cloth-pack-4",
    description:
      "Everyday microfiber cleaning cloth suitable for automotive cleaning, interior cleaning and general detailing. Pack of 4.",
    price: 320,
    image: "/products/mf350-1.jpg",
    category: "microfiber",
  },
  {
    id: "6",
    name: "Motoman Microfiber Cleaning Gloves",
    slug: "motoman-microfiber-cleaning-gloves",
    description:
      "Soft microfiber cleaning gloves designed for convenient car and bike cleaning, detailing and surface care.",
    price: 189,
    compareAtPrice: 220,
    image: "/products/gloves-1.jpg",
    category: "microfiber",
  },
  {
    id: "7",
    name: "Motoman Glass Cleaning Microfiber Cloth — Set of 4",
    slug: "motoman-glass-cleaning-microfiber-cloth-set-of-4",
    description:
      "Soft microfiber cloths for streak-free cleaning of car, bike and scooter glass. Set of 4.",
    price: 339,
    compareAtPrice: 500,
    image: "/products/glass-cloth-1.jpg",
    category: "microfiber",
  },
  {
    id: "8",
    name: "Motoman 350 GSM Microfiber Cloth — Set of 4",
    slug: "motoman-350-gsm-microfiber-cloth-set-of-4",
    description:
      "Keep your vehicle clean with the Motoman 350 GSM Microfiber Cloth Set of 4. These reusable microfiber cloths are suitable for everyday automotive cleaning and help remove dust, fingerprints, and light dirt from vehicle surfaces.",
    price: 399,
    compareAtPrice: 499,
    image: "/products/motoman-350gsm-microfiber-set-4.webp",
    category: "microfiber",
  },
  {
    id: "9",
    name: "Motoman Microfiber Cleaning Gloves — Set of 2",
    slug: "motoman-microfiber-cleaning-gloves-set-of-2",
    description:
      "Make your vehicle-cleaning routine easier with Motoman Microfiber Cleaning Gloves. Their plush chenille microfiber texture helps lift dust and dirt during everyday car washing and cleaning. The glove-style design provides a convenient grip while cleaning vehicle surfaces.",
    price: 329,
    compareAtPrice: 499,
    image: "/products/motoman-microfiber-cleaning-gloves-set-2.webp",
    category: "microfiber",
  },
];

export interface ComboProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  tags: string[];
  variants: { name: string; size: string }[];
}

/**
 * Static fallback for the homepage "Combo Offers" section when the database
 * is unavailable. The live section reads the same products from the catalog.
 */
/** Homepage Combo Offers, in display order. */
export const HOMEPAGE_COMBO_SLUGS = [
  "motoman-complete-car-care-combo",
  "motoman-foam-can-car-shampoo-combo",
  "motoman-shampoo-microfiber-combo",
] as const;

export const COMBO_PRODUCTS: ComboProduct[] = [
  {
    id: "combo-complete-care",
    name: "Complete Car Care Combo",
    slug: "motoman-complete-car-care-combo",
    description:
      "Foam sprayer, 500 ml shampoo, 1200 GSM cloth, and a blue cleaning glove.",
    price: 1299,
    compareAtPrice: null,
    image: "/products/motoman-complete-car-care-combo.webp",
    tags: ["combo"],
    variants: [{ name: "Combo", size: "1 Combo" }],
  },
  {
    id: "combo-foam-shampoo",
    name: "Foam Can + Car Shampoo",
    slug: "motoman-foam-can-car-shampoo-combo",
    description: "Foam sprayer and 500 ml Premium Car Shampoo.",
    price: 699,
    compareAtPrice: null,
    image: "/products/motoman-foam-can-shampoo-combo.webp",
    tags: ["combo"],
    variants: [{ name: "Combo", size: "1 Combo" }],
  },
  {
    id: "combo-shampoo-microfiber",
    name: "Car Shampoo + Microfiber Cleaning Kit",
    slug: "motoman-shampoo-microfiber-combo",
    description:
      "500 ml Premium Car Shampoo, a microfiber cloth, and a blue cleaning glove.",
    price: 599,
    compareAtPrice: null,
    image: "/products/motoman-shampoo-microfiber-combo.webp",
    tags: ["combo"],
    variants: [{ name: "Combo", size: "1 Combo" }],
  },
];

export interface LegacyCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export const CATEGORIES: LegacyCategory[] = [
  {
    id: "1",
    name: "Car Wash",
    slug: "car-wash",
    description: "Shampoos, foams & wash essentials",
    image: "/category/CarWash.png",
    productCount: 2,
  },
  {
    id: "2",
    name: "Microfiber",
    slug: "microfiber",
    description: "Cloths, gloves & glass cleaning essentials",
    image: "/category/Microfiber.png",
    productCount: 7,
  },
  {
    id: "4",
    name: "Exterior Care",
    slug: "exterior-care",
    description: "Polish, wax & paint protection",
    image: "/category/exterior.jpg",
    productCount: 0,
  },
  {
    id: "5",
    name: "Accessories",
    slug: "accessories",
    description: "Buckets, brushes & detailing tools",
    image: "/category/accessories.jpg",
    productCount: 0,
  },
];

export const BUNDLE_ITEMS = [
  {
    name: "Car Shampoo",
    image: "/products/shampoo-1.jpg",
    alt: "Motoman Premium Car Shampoo 500 ml bottle",
  },
  {
    name: "Foam Sprayer Bottle",
    image: "/products/form-spray.jpeg",
    alt: "Motoman foam sprayer with a black handle and smoky transparent tank",
  },
  {
    name: "1200 GSM Microfiber Cloth",
    image: "/products/mf1200-1.jpg",
    alt: "Motoman 1200 GSM premium microfiber cloth",
  },
  {
    name: "Blue Cleaning Glove",
    image: "/products/gloves-1.jpg",
    alt: "Motoman blue chenille microfiber cleaning glove",
  },
] as const;

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: "truck",
    title: "Free Shipping",
    description: "On all orders",
  },
  {
    icon: "shield-check",
    title: "Secure Payments",
    description: "100% safe & secure",
  },
  {
    icon: "headphones",
    title: "Dedicated Support",
    description: "We're here to help",
  },
  {
    icon: "leaf",
    title: "Made for a Cleaner Tomorrow",
    description: "Greener Tomorrow",
  },
];

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The foam sprayer bottle completely changed my car wash routine. The foam distribution is even and the build quality is outstanding. Highly recommended for any car enthusiast.",
    avatar: "/avatars/rahul.jpg",
  },
  {
    id: "2",
    name: "Priya Patel",
    location: "Delhi",
    rating: 5,
    text: "I've tried many microfiber products but Motoman's quality is on another level. The wash mitt is incredibly soft and the cloths leave zero streaks. Premium quality at a great price.",
    avatar: "/avatars/priya.jpg",
  },
  {
    id: "3",
    name: "Arjun Reddy",
    location: "Bangalore",
    rating: 5,
    text: "The Complete Car Care Kit is everything you need. I was impressed by the packaging and the quality of each product. My car looks brand new after every wash.",
    avatar: "/avatars/arjun.jpg",
  },
];

export const HERO_FEATURES = [
  "Premium Quality",
  "Safe for All Surfaces",
  "Trusted by Car Enthusiasts",
  "Made for a Cleaner Tomorrow",
];

export const FOOTER_LINKS = {
  quickLinks: [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/car-care-products", label: "Car Care Products" },
    { href: "/microfiber-cloths", label: "Microfiber Cloths" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  categories: [
    { href: "/categories/car-wash", label: "Car Wash" },
    { href: "/categories/microfiber", label: "Microfiber" },
    { href: "/categories/exterior-care", label: "Exterior Care" },
    { href: "/categories/accessories", label: "Accessories" },
  ],
  legal: [
    { href: "/shipping-policy", label: "Shipping Policy" },
    { href: "/return-policy", label: "Returns" },
    { href: "/refund-policy", label: "Refunds" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms" },
  ],
  social: [
    { href: "https://www.instagram.com/motomanstore_?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==", label: "Instagram", icon: "instagram" },
    { href: "https://www.facebook.com/share/1DrgsVAhq9/?mibextid=wwXIfr", label: "facebook", icon: "facebook" },
  ],
};


hello