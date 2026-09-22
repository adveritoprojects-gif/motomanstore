import { Container } from "@/components/ui/container";

export default function ShopLoading() {
  return (
    <Container size="xl" className="py-8 md:py-12" role="status" aria-label="Loading shop">
      <div className="mb-8">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-neutral-200" />
        <div className="mb-2 h-8 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-neutral-100" />
      </div>

      <div className="mb-6 flex gap-4 border-b border-neutral-200 pb-6">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-100" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white">
            <div className="aspect-square animate-pulse bg-neutral-100 rounded-t-lg" />
            <div className="p-4">
              <div className="mb-1 h-3 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="mb-1 h-4 w-full animate-pulse rounded bg-neutral-200" />
              <div className="mb-3 h-3 w-3/4 animate-pulse rounded bg-neutral-100" />
              <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
