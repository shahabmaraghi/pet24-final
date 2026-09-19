"use client";
import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategory, type Category } from "@/lib/data";
import { useStoreProducts } from "@/lib/use-store-products";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const all = useStoreProducts({ categoryId: id });
  const [category, setCategory] = React.useState<Category | null | "loading">("loading");
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
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
    return <div className="py-16 text-center text-muted-foreground">در حال بارگذاری...</div>;
  }
  if (!category) notFound();

  const types = [...new Set(all.map((p) => p.type).filter(Boolean))];
  const products = typeFilter ? all.filter((p) => p.type === typeFilter) : all;

  return (
    <>
      <div className="mb-4 text-[13px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">خانه</Link> / {category.name}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold text-primary">{category.name}</h1>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${typeFilter === t ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">محصولی با این فیلتر یافت نشد.</div>
      )}
    </>
  );
}
