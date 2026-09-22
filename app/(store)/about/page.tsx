import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about MOTOMAN — our mission to provide professional-grade car care products for every driver.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | MOTOMAN",
    description: "Learn about MOTOMAN — our mission to provide professional-grade car care products.",
    type: "website",
    siteName: "MOTOMAN",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | MOTOMAN",
    description: "Learn about MOTOMAN — our mission to provide professional-grade car care products.",
  },
};

export default function AboutPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Our Story
      </Typography>
      <Typography variant="h1" className="mb-6">
        About {process.env.NEXT_PUBLIC_BRAND || "MOTOMAN"}
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        We believe every car deserves premium care. Our products are crafted for
        car enthusiasts who demand nothing but the best.
      </Typography>

      <Separator className="my-12" />

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <Typography variant="h3" className="mb-4">
            Our Mission
          </Typography>
          <Typography variant="body" className="text-neutral-500">
            To provide professional-grade car care products that deliver
            showroom results at home. We focus on quality materials, effective
            formulas, and products that car enthusiasts trust.
          </Typography>
        </div>
        <div>
          <Typography variant="h3" className="mb-4">
            Our Values
          </Typography>
          <Typography variant="body" className="text-neutral-500">
            Quality craftsmanship, automotive passion, and a commitment to
            sustainability guide everything we do. We believe great car care
            products should be accessible to every driver.
          </Typography>
        </div>
      </div>
    </Container>
  );
}
