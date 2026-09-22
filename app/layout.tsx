import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { MobileBottomNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawerProvider } from "@/components/cart";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MOTOMAN — Premium Car Care",
    template: "%s | MOTOMAN",
  },
  description:
    "Professional car care products designed for a cleaner, shinier and longer-lasting drive. Shop premium shampoos, waxes, microfiber cloths and more.",
  keywords: ["car care", "car wash", "car shampoo", "microfiber", "car wax", "polish", "premium car care", "MOTOMAN"],
  authors: [{ name: "MOTOMAN" }],
  creator: "MOTOMAN",
  publisher: "MOTOMAN",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "MOTOMAN",
    title: "MOTOMAN — Premium Car Care",
    description: "Professional car care products designed for a cleaner, shinier and longer-lasting drive.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MOTOMAN Premium Car Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOTOMAN — Premium Car Care",
    description: "Professional car care products designed for a cleaner, shinier and longer-lasting drive.",
    images: ["/og-image.jpg"],
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
  alternates: {
    canonical: siteUrl,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Analytics />
        <CartDrawerProvider />
        <Navbar />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
