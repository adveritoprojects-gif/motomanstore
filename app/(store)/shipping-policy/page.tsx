import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Shipping Policy",
  description:
    "Read the MOTOMAN shipping policy — how we pack and dispatch car care orders, plus our free shipping details.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>
      <Typography variant="h1" className="mb-6">
        Shipping Policy
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        How MOTOMAN packs and ships your car care orders.
      </Typography>

      <div className="max-w-2xl space-y-6 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Free Shipping
          </Typography>
          <Typography variant="body">
            We offer free shipping on all orders — no minimum purchase
            required. Shipping is always shown as free at checkout.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Dispatch &amp; Delivery
          </Typography>
          <Typography variant="body">
            Orders are packed with care to protect bottles, cloths and kits in
            transit. Delivery timelines depend on your pin code and are shown
            at checkout. You will receive updates on your order using the
            contact details you provide when ordering.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Questions
          </Typography>
          <Typography variant="body">
            Need help with a shipment? Email us at{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {BRAND.email}
            </a>{" "}
            or visit our{" "}
            <Link
              href="/contact"
              className="text-orange-500 hover:text-orange-600"
            >
              contact page
            </Link>
            .
          </Typography>
        </section>
      </div>
    </Container>
  );
}
