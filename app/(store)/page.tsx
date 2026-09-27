import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategorySection } from "@/components/home/category-section";
import { BestSellers } from "@/components/home/best-sellers";
import { ComboOffers } from "@/components/home/combo-offers";
import { BundleBanner } from "@/components/home/bundle-banner";
import { BenefitsSection } from "@/components/home/benefits-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { getBestSellers, getComboOffers, getCategories } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Car Care & Detailing Products Online",
  absoluteTitle: "Car Care & Detailing Products Online | MOTOMAN",
  description:
    "Shop premium car care products, detailing supplies, microfiber cloths and car cleaning essentials online at MOTOMAN. Quality products for a cleaner, better-looking car.",
  path: "/",
});

export default async function HomePage() {
  let categories = null;
  let bestSellers = null;
  let comboOffers = null;

  try {
    [categories, bestSellers, comboOffers] = await Promise.all([
      getCategories(),
      getBestSellers(5),
      getComboOffers(4),
    ]);
  } catch {
    // Database not available
  }

  return (
    <>
      <Hero />
      <CategorySection categories={categories ?? undefined} />
      <BestSellers products={bestSellers ?? undefined} />
      <ComboOffers products={comboOffers ?? undefined} />
      <BundleBanner />
      <BenefitsSection />
      <TestimonialSection />
    </>
  );
}
