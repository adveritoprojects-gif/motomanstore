import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy",
  description:
    "Read the MOTOMAN refund policy for damaged, defective, and returned car care products, including eligibility, shipping charges, and refund timelines.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>

      <Typography variant="h1" className="mb-6">
        Returns &amp; Refund Policy
      </Typography>

      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        Please read our return, replacement, and refund terms carefully before
        requesting a return or exchange.
      </Typography>

      <div className="max-w-3xl space-y-8 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            1. Reporting Damaged or Defective Products
          </Typography>

          <Typography variant="body">
            Any damage, manufacturing defect, or request for a size change must
            be reported to our customer support team within 24 hours of
            delivery. Please contact us at{" "}
            <a
              href="tel:7591960202"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
             +91 89431 76189
            </a>
            .
          </Typography>

          <Typography variant="body" className="mt-3">
            Once your return request is approved, the product must be sent back
            within 7 days. Requests reported after the 24-hour reporting window
            may not be eligible under this policy.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            2. Unboxing Video Requirement
          </Typography>

          <Typography variant="body">
            For quality assurance and to support claims involving damage,
            manufacturing defects, or incomplete shipments, we strongly request
            that you record an unboxing video when receiving your package. Begin
            recording before opening the package and continue throughout the
            unboxing process, without removing the packaging tape before
            recording starts.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            3. Replacement and Refund Eligibility
          </Typography>

          <Typography variant="body">
            For eligible damaged or defective products, we will generally
            arrange a replacement. A refund for the affected product will be
            initiated only if the same product is unavailable in our stock.
            Otherwise, the product will be replaced.
          </Typography>

          <Typography variant="body" className="mt-3">
            Returned products must be in new and unused condition and include
            the original box or packaging, along with all tags and accessories,
            where applicable. Refunds or replacements are subject to a
            successful inspection.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            4. Products Purchased During Sales
          </Typography>

          <Typography variant="body">
            Products purchased during sale events or using discount offers are
            not eligible for refunds or replacements under this policy.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            5. Return and Exchange Shipping Charges
          </Typography>

          <Typography variant="body">
            Customers are responsible for shipping costs associated with returns
            and exchanges.
          </Typography>

          <Typography variant="body" className="mt-3">
            For approved claims involving manufacturing defects or damage, we
            will reimburse the return shipping cost up to the shipping amount
            recorded in the original order, or the actual return shipping cost,
            whichever is lower.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            6. Refund Processing and Deductions
          </Typography>

          <Typography variant="body">
            Once a returned product has been inspected and approved, the refund
            process will begin. Applicable payment gateway or payment processing
            fees may be deducted from cash or bank refunds, where permitted by
            applicable law and the terms disclosed at purchase.
          </Typography>

          <Typography variant="body" className="mt-3">
            The final refund amount will be communicated to the customer before
            the refund is processed. Any applicable deductions will be explained
            as part of the refund confirmation.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            7. Refund Timeline
          </Typography>

          <Typography variant="body">
            Approved refunds will be processed by MOTOMAN within 7 business days
            after the refund is approved. The time taken for the refunded amount
            to appear in your account may vary depending on your bank, card
            issuer, UPI provider, or payment service provider.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            8. How to Request a Return or Refund
          </Typography>

          <Typography variant="body">
            To request a return, replacement, or refund, contact our customer
            support team within the applicable reporting period. Please provide
            your order number, a description of the issue, and relevant
            photographs or an unboxing video where available.
          </Typography>

          <Typography variant="body" className="mt-3">
            Please review our{" "}
            <Link
              href="/return-policy"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Return Policy
            </Link>{" "}
            for any additional return instructions.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-3 text-neutral-900">
            9. Contact Us
          </Typography>

          <Typography variant="body">
            For questions about returns, replacements, or refunds, contact
            MOTOMAN customer support:
          </Typography>

          <div className="mt-3 space-y-2">
            <Typography variant="body">
              <span className="font-medium text-neutral-900">Phone: </span>
              <a
                href="tel:7591960202"
                className="text-orange-500 hover:text-orange-600"
              >
               +91 89431 76189
              </a>
            </Typography>

            <Typography variant="body">
              <span className="font-medium text-neutral-900">Email: </span>
              <a
                href={`mailto:${BRAND.email}`}
                className="text-orange-500 hover:text-orange-600"
              >
                {BRAND.email}
              </a>
            </Typography>
          </div>
        </section>
      </div>
    </Container>
  );
}


// finel 