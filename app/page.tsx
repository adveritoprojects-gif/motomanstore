import { Hero } from "@/components/home/hero";
import { CategorySection } from "@/components/home/category-section";
import { BestSellers } from "@/components/home/best-sellers";
import { BundleBanner } from "@/components/home/bundle-banner";
import { BenefitsSection } from "@/components/home/benefits-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { getCategories, getFeaturedProducts } from "@/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MOTOMAN",
  url: siteUrl,
  description: "Professional car care products designed for a cleaner, shinier and longer-lasting drive.",
  email: "hello@motoman.in",
  telephone: "+91 98765 43210",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
};

export default async function HomePage() {
  let categories = null;
  let featuredProducts = null;

  try {
    [categories, featuredProducts] = await Promise.all([
      getCategories(),
      getFeaturedProducts(5),
    ]);
  } catch {
    // Database not available
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <CategorySection categories={categories ?? undefined} />
      <BestSellers products={featuredProducts ?? undefined} />
      <BundleBanner />
      <BenefitsSection />
      <TestimonialSection />
    </>
  );
}
