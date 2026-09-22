import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { BRAND } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with MOTOMAN. We typically respond within 24 hours during business days.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | MOTOMAN",
    description: "Get in touch with MOTOMAN. We typically respond within 24 hours.",
    type: "website",
    siteName: "MOTOMAN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | MOTOMAN",
    description: "Get in touch with MOTOMAN. We typically respond within 24 hours.",
  },
};

export default function ContactPage() {
  return (
    <Container size="lg" className="py-12 md:py-16">
      <Typography variant="overline" className="mb-4 text-orange-500">
        Get in Touch
      </Typography>
      <Typography variant="h1" className="mb-6">
        Contact Us
      </Typography>
      <Typography variant="lead" className="mb-8 max-w-2xl text-neutral-500">
        Have a question or want to get in touch? We&apos;d love to hear from you.
      </Typography>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <Typography variant="h3" className="mb-4">
            Email
          </Typography>
          <Typography variant="body" className="mb-6 text-neutral-500">
            {BRAND.email}
          </Typography>

          <Typography variant="h3" className="mb-4">
            Phone
          </Typography>
          <Typography variant="body" className="mb-6 text-neutral-500">
            {BRAND.phone}
          </Typography>

          <Typography variant="h3" className="mb-4">
            Response Time
          </Typography>
          <Typography variant="body" className="text-neutral-500">
            We typically respond within 24 hours during business days.
          </Typography>
        </div>

        <div>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="h-10 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="h-10 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full resize-none border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
