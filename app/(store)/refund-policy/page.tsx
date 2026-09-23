import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy",
  description:
    "Read the MOTOMAN refund policy — when and how refunds are issued for cancelled or returned car care orders.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>
      <Typography variant="h1" className="mb-6">
        Refund Policy
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        How refunds are handled for MOTOMAN orders.
      </Typography>

      <div className="max-w-2xl space-y-6 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            When Refunds Apply
          </Typography>
          <Typography variant="body">
            If an order is cancelled, returned or found to be faulty after our{" "}
            <Link
              href="/return-policy"
              className="text-orange-500 hover:text-orange-600"
            >
              return process
            </Link>
            , we refund the amount paid for the eligible items.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            How Refunds Are Issued
          </Typography>
          <Typography variant="body">
            Refunds are issued to the original payment method used at
            checkout. Processing time depends on your bank or payment provider
            after we initiate the refund. You&apos;ll be notified by email
            once the refund is processed from our side.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Questions
          </Typography>
          <Typography variant="body">
            For refund status or questions, email{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {BRAND.email}
            </a>{" "}
            with your order number.
          </Typography>
        </section>
      </div>
    </Container>
  );
}
