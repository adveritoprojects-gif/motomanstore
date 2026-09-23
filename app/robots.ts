import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/checkout",
          "/order-success",
          "/login",
          "/api/",
          // Faceted / sorted / paginated URLs — keep canonical pages only
          "/*?sort=*",
          "/*?page=*",
          "/*?q=*",
          "/*?category=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
