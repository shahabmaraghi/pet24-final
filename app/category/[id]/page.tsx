"use client";
import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGridSkeleton } from "@/components/product-card-skeleton";
import { ProductInfiniteGrid } from "@/components/product-infinite-grid";
import { decodeCategoryParam } from "@/lib/category-id";
import { getCategory, type Category } from "@/lib/data";
import { useInfiniteProducts } from "@/lib/use-infinite-products";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = React.use(params);
  const id = decodeCategoryParam(rawId);
  const [category, setCategory] = React.useState<Category | null | "loading">("loading");
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);

  const { products, types, total, loading, loadingMore, hasMore, loadMore } = useInfiniteProducts({
    categoryId: id,
    type: typeFilter,
    limit: 24,
    enabled: category !== "loading" && Boolean(category),
  });

  React.useEffect(() => {
    let cancelled = false;
    setCategory("loading");
    setTypeFilter(null);
    fetch(`/api/categories/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => {
        if (res.status === 404) return null;
        return res.ok ? res.json() : Promise.reject(new Error("failed"));
      })
      .then((item) => {
        if (cancelled) return;
        if (item?.id) {
          setCategory({ id: String(item.id), name: String(item.name), tint: String(item.tint || "#6b7280") });
          return;
        }
        setCategory(null);
      })
      .catch(() => {
        if (!cancelled) setCategory(getCategory(id) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (category === "loading") {
    return (
      <>
        <div className="mb-6 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <ProductGridSkeleton count={8} />
      </>
    );
  }
  if (!category) notFound();

  return (
    <>
      <div className="mb-4 text-[13px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">خانه</Link> / {category.name}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-[26px] font-extrabold text-primary">{category.name}</h1>
          {!loading && total > 0 ? (
            <span className="text-[13px] text-muted-foreground">{total.toLocaleString("fa-IR")} محصول</span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${typeFilter === t ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ProductInfiniteGrid
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyMessage="محصولی با این فیلتر یافت نشد."
      />
    </>
  );
}
