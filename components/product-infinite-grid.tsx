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
  columnsClassName = "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
  leading,
}: {
  products: StoreProduct[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  emptyMessage: string;
  showEndMessage?: boolean;
  columnsClassName?: string;
  leading?: React.ReactNode;
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

  if (loading) {
    if (!leading) return <ProductGridSkeleton count={8} />;
    return (
      <div className={`grid items-start ${columnsClassName} [grid-auto-flow:dense]`}>
        <div className="row-span-2 self-stretch">{leading}</div>
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`grid gap-4 ${leading ? "lg:grid-cols-[240px_minmax(0,1fr)]" : ""}`}>
        {leading ? <div className="self-start">{leading}</div> : null}
        <div className="py-16 text-center text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <>
      <div className={`grid items-start ${columnsClassName} [grid-auto-flow:dense]`}>
        {leading ? <div className="row-span-2 self-stretch">{leading}</div> : null}
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
