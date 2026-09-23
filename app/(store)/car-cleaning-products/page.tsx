import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("car-cleaning-products")!;

export const metadata = landingMetadata(page);

export default function CarCleaningProductsPage() {
  return <LandingPageView pageKey="car-cleaning-products" />;
}
