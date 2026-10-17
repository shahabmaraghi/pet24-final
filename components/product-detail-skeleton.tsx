import { ProductGridSkeleton } from "@/components/product-card-skeleton";

export function ProductDetailSkeleton() {
  return (
    <>
      <div className="mb-4 h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="mb-14 grid gap-10 md:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 border-t pt-5">
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="mb-8 h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="mb-14 h-56 animate-pulse rounded-2xl border bg-muted/40" />
      <div className="mb-5 h-7 w-40 animate-pulse rounded bg-muted" />
      <ProductGridSkeleton count={4} />
    </>
  );
}
