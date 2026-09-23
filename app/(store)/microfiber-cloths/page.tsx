import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("microfiber-cloths")!;

export const metadata = landingMetadata(page);

export default function MicrofiberClothsPage() {
  return <LandingPageView pageKey="microfiber-cloths" />;
}
