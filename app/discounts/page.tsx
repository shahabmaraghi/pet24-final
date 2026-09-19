"use client";
import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { getCategory } from "@/lib/data";
import { useStoreProducts } from "@/lib/use-store-products";

export default function DiscountsPage() {
  const [filter, setFilter] = React.useState<string | null>(null);
  const products = useStoreProducts();
  const discounted = products.filter((p) => p.oldPrice);
  const catIds = Array.from(new Set(discounted.map((p) => p.categoryId)));
  const filters = [{ id: null as string | null, name: "همه" }, ...catIds.map((id) => ({ id, name: getCategory(id)?.name ?? id }))];
  const shown = filter ? discounted.filter((p) => p.categoryId === filter) : discounted;

  return (
    <>
      <div className="mb-4 text-[13px] text-muted-foreground">
        <a href="/" className="hover:text-primary">خانه</a> / تخفیف‌ها
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold text-[#b23b3b]">محصولات تخفیف‌دار</h1>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id ?? "all"}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${
                filter === f.id ? "border-[#b23b3b] bg-[#b23b3b] text-white" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-muted-foreground">در حال حاضر محصول تخفیف‌داری وجود ندارد.</div>
      )}
    </>
  );
}
