import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("exterior-car-cleaning")!;

export const metadata = landingMetadata(page);

export default function ExteriorCarCleaningPage() {
  return <LandingPageView pageKey="exterior-car-cleaning" />;
}
