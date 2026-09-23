import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { pageMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Read the MOTOMAN privacy policy — what personal information we collect when you shop for car care products and how we use it.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Policies
      </Typography>
      <Typography variant="h1" className="mb-6">
        Privacy Policy
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        Your privacy matters to us. This policy explains what we collect and
        why.
      </Typography>

      <div className="max-w-2xl space-y-6 text-neutral-600">
        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Information We Collect
          </Typography>
          <Typography variant="body">
            When you place an order or contact us, we collect the information
            needed to fulfil your order and respond to you — such as your name,
            email address, phone number, shipping address and order details.
            Payment processing is handled securely by our payment provider
            (Razorpay); we do not store your full card details on our servers.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            How We Use Your Information
          </Typography>
          <Typography variant="body">
            We use your information to process and ship orders, send order
            updates, provide customer support, and improve the store. We do not
            sell your personal information to third parties.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Cookies &amp; Analytics
          </Typography>
          <Typography variant="body">
            The site may use cookies and analytics tools to understand how the
            store is used and to keep features like your shopping cart working.
            You can control cookies through your browser settings.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Data Security
          </Typography>
          <Typography variant="body">
            We take reasonable technical and organisational steps to protect
            your information from unauthorised access or misuse.
          </Typography>
        </section>

        <section>
          <Typography variant="h4" className="mb-2 text-neutral-900">
            Contact Us
          </Typography>
          <Typography variant="body">
            Questions about this policy? Email{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {BRAND.email}
            </a>{" "}
            or use our{" "}
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
