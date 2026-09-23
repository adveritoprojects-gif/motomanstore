import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("car-care-products")!;

export const metadata = landingMetadata(page);

export default function CarCareProductsPage() {
  return <LandingPageView pageKey="car-care-products" />;
}
