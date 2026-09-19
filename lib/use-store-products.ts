"use client";

import * as React from "react";
import { serializeProduct, type StoreProduct } from "@/lib/store-product";

export function useStoreProducts(filter: { categoryId?: string; featured?: boolean } = {}) {
  const [products, setProducts] = React.useState<StoreProduct[]>([]);

  React.useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter.categoryId) params.set("categoryId", filter.categoryId);
    if (filter.featured) params.set("featured", "1");
    let cancelled = false;
    fetch(`/api/products?${params}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items.map(serializeProduct) : [];
        setProducts(items);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [filter.categoryId, filter.featured]);

  return products;
}
