"use client";

import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton, ProductGridSkeleton } from "@/components/product-card-skeleton";
import type { StoreProduct } from "@/lib/store-product";

export function ProductInfiniteGrid({
  products,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  emptyMessage,
  showEndMessage = true,
}: {
  products: StoreProduct[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  emptyMessage: string;
  showEndMessage?: boolean;
}) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "320px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loading, products.length]);

  if (loading) return <ProductGridSkeleton count={8} />;

  if (products.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loadingMore
          ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={`more-${i}`} />)
          : null}
      </div>
      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
      {loadingMore ? (
        <p className="mt-2 text-center text-[13px] text-muted-foreground">در حال بارگذاری محصولات بیشتر...</p>
      ) : null}
      {showEndMessage && !hasMore ? (
        <p className="mt-4 text-center text-[12px] text-muted-foreground">همه محصولات نمایش داده شد</p>
      ) : null}
    </>
  );
}
