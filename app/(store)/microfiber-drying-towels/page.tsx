import { LandingPageView } from "@/components/seo/landing-page";
import { getLandingPage, landingMetadata } from "@/lib/seo/landing-pages";

const page = getLandingPage("microfiber-drying-towels")!;

export const metadata = landingMetadata(page);

export default function MicrofiberDryingTowelsPage() {
  return <LandingPageView pageKey="microfiber-drying-towels" />;
}
