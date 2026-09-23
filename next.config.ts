import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      // Alias kept for keyword URL consistency — /car-cleaning-products is canonical
      {
        source: "/car-wash-products",
        destination: "/car-cleaning-products",
        permanent: true,
      },
      // Global nav links that don't have dedicated pages yet.
      // Edge-level redirects return real 3xx (not meta-refresh) and
      // preserve query strings (e.g. /search?q=… → /shop?q=…).
      // temporary (307) so they can be replaced by real pages later
      // without fighting browser/CDN caches of a permanent redirect.
      {
        source: "/cart",
        destination: "/checkout",
        permanent: false,
      },
      {
        source: "/account",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/search",
        destination: "/shop",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
