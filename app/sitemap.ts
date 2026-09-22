import type { MetadataRoute } from "next";
import { getProducts, getCategories, getCollections } from "@/lib/queries";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const products = await getProducts({ limit: 500 });
    const productPages: MetadataRoute.Sitemap = products.products.map(
      (product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    const categories = await getCategories();
    const categoryPages: MetadataRoute.Sitemap = categories.map(
      (category) => ({
        url: `${BASE_URL}/categories/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    );

    const collections = await getCollections();
    const collectionPages: MetadataRoute.Sitemap = collections.map(
      (collection) => ({
        url: `${BASE_URL}/collections/${collection.slug}`,
        lastModified: collection.updatedAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    );

    return [...staticPages, ...productPages, ...categoryPages, ...collectionPages];
  } catch {
    return staticPages;
  }
}
