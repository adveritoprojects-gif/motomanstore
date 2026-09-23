import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./json-ld";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/json-ld";

interface BreadcrumbsProps {
  /** Final crumb (current page) has no href. */
  items: BreadcrumbItem[];
}

/**
 * Visual breadcrumb nav + BreadcrumbList JSON-LD.
 * Items must match real routes (e.g. Home → /, Category → /categories/microfiber).
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const normalized: BreadcrumbItem[] = [{ name: "Home", item: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(normalized)} />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-neutral-500"
      >
        {normalized.map((crumb, i) => {
          const isLast = i === normalized.length - 1;
          return (
            <span key={`${crumb.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
              )}
              {crumb.item && !isLast ? (
                <Link
                  href={crumb.item}
                  className="transition-colors hover:text-orange-500"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-neutral-900" aria-current={isLast ? "page" : undefined}>
                  {crumb.name}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
