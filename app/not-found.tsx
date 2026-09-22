import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container size="lg" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mb-4 text-7xl font-bold text-orange-500">404</p>
      <h1 className="mb-3 text-2xl font-bold text-neutral-950">Page Not Found</h1>
      <p className="mb-8 max-w-md text-sm text-neutral-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Browse Shop
        </Link>
      </div>
    </Container>
  );
}
