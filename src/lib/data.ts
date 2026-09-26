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
    description: "Handheld foam sprayer designed for convenient car and bike cleaning.",
    price: 599,
    compareAtPrice: 699,
    image: "/products/sprayer-1.jpg",
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
    name: "Motoman Glass Cleaning Microfiber Cloth",
    slug: "motoman-glass-cleaning-microfiber-cloth",
    description:
      "Specialized microfiber cloth designed for streak-free glass and windshield cleaning. Set of 4.",
    price: 399,
    image: "/products/glass-1.jpg",
    category: "microfiber",
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
    productCount: 2,
  },
  {
    id: "2",
    name: "Microfiber",
    slug: "microfiber",
    description: "Cloths, gloves & glass cleaning essentials",
    image: "/categories/microfiber.jpg",
    productCount: 5,
  },
  {
    id: "4",
    name: "Exterior Care",
    slug: "exterior-care",
    description: "Polish, wax & paint protection",
    image: "/categories/exterior.jpg",
    productCount: 0,
  },
  {
    id: "5",
    name: "Accessories",
    slug: "accessories",
    description: "Buckets, brushes & detailing tools",
    image: "/categories/accessories.jpg",
    productCount: 0,
  },
];

export const BUNDLE_ITEMS = [
  "Car Shampoo",
  "Foam Sprayer Bottle",
  "1200 GSM Microfiber Cloth",
  "Microfiber Gloves",
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
    { href: "https://instagram.com", label: "Instagram", icon: "instagram" },
    { href: "https://pinterest.com", label: "Pinterest", icon: "pin" },
    { href: "https://youtube.com", label: "YouTube", icon: "youtube" },
  ],
};
