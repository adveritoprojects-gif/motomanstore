import type { Metadata } from "next";
import { Google_Sans, Google_Sans_Flex } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  fallback: ["Arial", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: false,
});

const googleSansDisplay = Google_Sans_Flex({
  variable: "--font-google-sans-display",
  subsets: ["latin"],
  fallback: ["Arial", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: false,
});

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in").replace(/\/$/, "");

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "MOTOMAN — Premium Car Care & Detailing Products",
    template: "%s | MOTOMAN",
  },
  description:
    "Shop premium car care products, detailing supplies, microfiber cloths and car cleaning essentials online at MOTOMAN. Quality products for a cleaner, better-looking car.",
  keywords: [
    "car care products",
    "car cleaning products",
    "car detailing products",
    "car wash products",
    "car care products online",
    "microfiber cloth for car",
    "car detailing supplies",
    "car care accessories",
    "MOTOMAN",
  ],
  authors: [{ name: "MOTOMAN" }],
  creator: "MOTOMAN",
  publisher: "MOTOMAN",
  // Canonical is intentionally NOT set here — each page sets its own via
  // generateMetadata/pageMetadata. A root-level canonical would leak the
  // homepage URL onto checkout, login, admin, etc.
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "MOTOMAN",
    title: "MOTOMAN — Premium Car Care & Detailing Products",
    description:
      "Shop premium car care products, detailing supplies, microfiber cloths and car cleaning essentials online at MOTOMAN.",
    // Site-wide default OG image comes from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "MOTOMAN — Premium Car Care & Detailing Products",
    description:
      "Shop premium car care products, detailing supplies, microfiber cloths and car cleaning essentials online at MOTOMAN.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${googleSansDisplay.variable} h-full antialiased`}
    >
      <head>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="min-h-full flex flex-col">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
