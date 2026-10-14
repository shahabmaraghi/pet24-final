"use client";

import * as React from "react";
import { serializeProduct, type StoreProduct } from "@/lib/store-product";

export function useStoreProducts(filter: { categoryId?: string; brandId?: string; featured?: boolean; enabled?: boolean } = {}) {
  const [products, setProducts] = React.useState<StoreProduct[]>([]);
  const enabled = filter.enabled !== false;

  React.useEffect(() => {
    if (!enabled) {
      setProducts([]);
      return;
    }
    const params = new URLSearchParams({ limit: "100" });
    if (filter.categoryId) params.set("categoryId", filter.categoryId);
    if (filter.brandId) params.set("brandId", filter.brandId);
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
  }, [filter.categoryId, filter.brandId, filter.featured, enabled]);

  return products;
}
