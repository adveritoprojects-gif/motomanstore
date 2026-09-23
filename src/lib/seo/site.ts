/** Canonical site origin. Never hardcode localhost — set NEXT_PUBLIC_APP_URL in Vercel. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://motoman.in"
).replace(/\/$/, "");

export const SITE_NAME = "MOTOMAN";
export const SITE_LOCALE = "en_IN";
export const DEFAULT_CURRENCY = "INR";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Resolve a stored image path/URL to an absolute URL. Returns undefined when empty. */
export function absoluteImage(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined;
  return absoluteUrl(url);
}
