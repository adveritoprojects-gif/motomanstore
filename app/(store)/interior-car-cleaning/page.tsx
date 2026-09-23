import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("interior-car-cleaning")!;

export const metadata = landingMetadata(page);

export default function InteriorCarCleaningPage() {
  return <LandingPageView pageKey="interior-car-cleaning" />;
}
