export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-orange-500" />
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}
