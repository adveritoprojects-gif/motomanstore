import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("car-detailing-products")!;

export const metadata = landingMetadata(page);

export default function CarDetailingProductsPage() {
  return <LandingPageView pageKey="car-detailing-products" />;
}
