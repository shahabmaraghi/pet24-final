export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="h-44 w-full animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
