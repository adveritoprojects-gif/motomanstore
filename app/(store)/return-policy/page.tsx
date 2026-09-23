import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Return Policy",
  description:
    "Read the MOTOMAN return policy — how to request a return for car care products and what to expect from our easy returns process.",
  path: "/return-policy",
});

export default function ReturnPolicyPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>
      <Typography variant="h1" className="mb-6">
        Return Policy
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        We want you to be happy with your MOTOMAN purchase.
      </Typography>

      <div className="max-w-2xl space-y-6 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Eligible Returns
          </Typography>
          <Typography variant="body">
            If your order arrives damaged, incorrect or faulty, contact us and
            we&apos;ll make it right. Products should be unused and in their
            original packaging where possible.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            How to Request a Return
          </Typography>
          <Typography variant="body">
            Email{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {BRAND.email}
            </a>{" "}
            with your order number and a short description (photos help us
            resolve things faster). You can also reach us via the{" "}
            <Link
              href="/contact"
              className="text-orange-500 hover:text-orange-600"
            >
              contact page
            </Link>
            . We&apos;ll confirm eligibility and guide you through the next
            steps.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Need Help First?
          </Typography>
          <Typography variant="body">
            Not sure which product fits your needs? Get in touch before you
            buy — we&apos;re happy to recommend the right car care product for
            your vehicle.
          </Typography>
        </section>
      </div>
    </Container>
  );
}
