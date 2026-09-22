export const BRAND = {
  logo: "/logo.png",
  name: "MOTOMAN",
  tagline: "PREMIUM CAR CARE",
  slogan: "Drive Cleaner. Drive Better.",
  description: "Professional car care products designed for a cleaner, shinier and longer-lasting drive.",
  email: "hello@motoman.in",
  phone: "+91 98765 43210",
  address: "Mumbai, Maharashtra, India",
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
    name: "Foam Sprayer Bottle",
    slug: "foam-sprayer-bottle",
    description: "High-density foam sprayer for even soap distribution.",
    price: 799,
    image: "/products/foam-sprayer.jpg",
    category: "car-wash",
  },
  {
    id: "2",
    name: "Car Shampoo (500ml)",
    slug: "car-shampoo-500ml",
    description: "pH-neutral car shampoo for a scratch-free wash.",
    price: 399,
    image: "/products/car-shampoo.jpg",
    category: "car-wash",
    badge: "Best Seller",
  },
  {
    id: "3",
    name: "Microfiber Cloth (3 Pack)",
    slug: "microfiber-cloth-3pack",
    description: "Ultra-absorbent microfiber cloths for streak-free drying.",
    price: 499,
    image: "/products/microfiber-cloth.jpg",
    category: "microfiber",
  },
  {
    id: "4",
    name: "Microfiber Wash Mitt",
    slug: "microfiber-wash-mitt",
    description: "Soft microfiber mitt that traps dirt safely.",
    price: 399,
    image: "/products/wash-mitt.jpg",
    category: "microfiber",
  },
  {
    id: "5",
    name: "Complete Car Care Kit",
    slug: "complete-car-care-kit",
    description: "Everything you need for a showroom finish in one kit.",
    price: 1299,
    compareAtPrice: 1599,
    image: "/products/care-kit.jpg",
    category: "bundles",
    badge: "Best Seller",
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
    image: "/categories/car-wash.jpg",
    productCount: 12,
  },
  {
    id: "2",
    name: "Microfiber",
    slug: "microfiber",
    description: "Cloths, mitts & drying towels",
    image: "/categories/microfiber.jpg",
    productCount: 8,
  },
  {
    id: "3",
    name: "Interior Care",
    slug: "interior-care",
    description: "Dashboard, seat & trim care",
    image: "/categories/interior.jpg",
    productCount: 10,
  },
  {
    id: "4",
    name: "Exterior Care",
    slug: "exterior-care",
    description: "Polish, wax & paint protection",
    image: "/categories/exterior.jpg",
    productCount: 9,
  },
];

export const BUNDLE_ITEMS = [
  "Car Shampoo",
  "Foam Sprayer Bottle",
  "Microfiber Cloth",
  "Microfiber Wash Mitt",
];

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: "truck",
    title: "Free Shipping",
    description: "On orders above ₹999",
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
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  categories: [
    { href: "/categories/car-wash", label: "Car Wash" },
    { href: "/categories/microfiber", label: "Microfiber" },
    { href: "/categories/interior-care", label: "Interior Care" },
    { href: "/categories/exterior-care", label: "Exterior Care" },
  ],
  social: [
    { href: "https://instagram.com", label: "Instagram", icon: "instagram" },
    { href: "https://pinterest.com", label: "Pinterest", icon: "pin" },
    { href: "https://youtube.com", label: "YouTube", icon: "youtube" },
  ],
};
