import { Container } from "@/components/ui/container";

export default function ProductLoading() {
  return (
    <Container size="xl" className="py-8 md:py-12" role="status" aria-label="Loading product">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-1">
        <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image skeleton */}
        <div className="aspect-square animate-pulse rounded-xl bg-neutral-100" />

        {/* Info skeleton */}
        <div>
          <div className="mb-3 h-4 w-24 animate-pulse rounded bg-neutral-100" />
          <div className="mb-3 h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-neutral-100" />
          <div className="mb-6 h-10 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="mb-6 h-4 w-48 animate-pulse rounded bg-neutral-100" />
          <div className="mb-6 h-20 w-full animate-pulse rounded bg-neutral-100" />
          <div className="mb-6 h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    </Container>
  );
}
