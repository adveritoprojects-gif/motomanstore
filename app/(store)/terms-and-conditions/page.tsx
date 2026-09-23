import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions for using the MOTOMAN website and purchasing car care and detailing products online.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>
      <Typography variant="h1" className="mb-6">
        Terms and Conditions
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        These terms govern your use of the MOTOMAN website and purchases made
        through it.
      </Typography>

      <div className="max-w-2xl space-y-6 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Use of the Website
          </Typography>
          <Typography variant="body">
            You may browse the store and place orders for personal use. Do not
            misuse the site — for example, by attempting unauthorised access,
            interfering with site operation, or placing fraudulent orders.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Products &amp; Pricing
          </Typography>
          <Typography variant="body">
            We aim to keep product information, images and prices accurate. In
            the event of a pricing or stock error, we may cancel the order and
            refund the amount paid. Product appearance may vary slightly from
            images depending on your screen.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Orders &amp; Payment
          </Typography>
          <Typography variant="body">
            An order is confirmed when payment is received. Payments are
            processed securely via Razorpay. Please provide accurate contact
            and shipping details so we can deliver your order.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Shipping, Returns &amp; Refunds
          </Typography>
          <Typography variant="body">
            Purchases are subject to our{" "}
            <Link
              href="/shipping-policy"
              className="text-orange-500 hover:text-orange-600"
            >
              shipping
            </Link>
            ,{" "}
            <Link
              href="/return-policy"
              className="text-orange-500 hover:text-orange-600"
            >
              return
            </Link>{" "}
            and{" "}
            <Link
              href="/refund-policy"
              className="text-orange-500 hover:text-orange-600"
            >
              refund
            </Link>{" "}
            policies.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Intellectual Property
          </Typography>
          <Typography variant="body">
            The MOTOMAN name, logo, site content and design belong to MOTOMAN
            or its licensors. You may not copy or reuse them without
            permission.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Contact
          </Typography>
          <Typography variant="body">
            Questions about these terms? Email{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {BRAND.email}
            </a>
            .
          </Typography>
        </section>
      </div>
    </Container>
  );
}
