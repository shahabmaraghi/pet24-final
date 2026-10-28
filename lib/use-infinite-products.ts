"use client";

import * as React from "react";
import { serializeProduct, type StoreProduct } from "@/lib/store-product";

export type ProductSort = "newest" | "oldest" | "price_asc" | "price_desc" | "name";
export type ImageFilter = "all" | "with" | "without";

type Options = {
  brandId?: string;
  categoryId?: string;
  type?: string | null;
  excludeId?: string;
  limit?: number;
  enabled?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  hasImage?: ImageFilter;
  sort?: ProductSort;
};

type State = {
  items: StoreProduct[];
  page: number;
  pages: number;
  total: number;
  types: string[];
  catalogMinPrice: number | null;
  catalogMaxPrice: number | null;
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
};

const initial: State = {
  items: [],
  page: 0,
  pages: 0,
  total: 0,
  types: [],
  catalogMinPrice: null,
  catalogMaxPrice: null,
  loading: true,
  loadingMore: false,
  error: false,
};

function buildParams(options: {
  page: number;
  limit: number;
  brandId?: string;
  categoryId?: string;
  type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  hasImage?: ImageFilter;
  sort?: ProductSort;
}) {
  const params = new URLSearchParams({ page: String(options.page), limit: String(options.limit) });
  if (options.brandId) params.set("brandId", options.brandId);
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.type) params.set("type", options.type);
  if (options.minPrice != null && Number.isFinite(options.minPrice)) params.set("minPrice", String(options.minPrice));
  if (options.maxPrice != null && Number.isFinite(options.maxPrice)) params.set("maxPrice", String(options.maxPrice));
  if (options.hasImage === "with") params.set("hasImage", "1");
  if (options.hasImage === "without") params.set("hasImage", "0");
  if (options.sort) params.set("sort", options.sort);
  return params;
}

export function useInfiniteProducts(options: Options) {
  const {
    brandId,
    categoryId,
    type,
    excludeId,
    limit = 24,
    enabled = true,
    minPrice = null,
    maxPrice = null,
    hasImage = "all",
    sort = "newest",
  } = options;
  const [state, setState] = React.useState<State>(initial);
  const busyRef = React.useRef(false);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const queryKey = [
    brandId || "",
    categoryId || "",
    type || "",
    excludeId || "",
    limit,
    enabled,
    minPrice ?? "",
    maxPrice ?? "",
    hasImage,
    sort,
  ].join("|");

  const withoutExcluded = React.useCallback(
    (items: StoreProduct[]) =>
      excludeId ? items.filter((item) => String(item.id) !== String(excludeId)) : items,
    [excludeId]
  );

  React.useEffect(() => {
    if (!enabled) {
      setState({ ...initial, loading: false });
      return;
    }

    let cancelled = false;
    busyRef.current = true;
    setState({ ...initial, loading: true });

    const params = buildParams({
      page: 1,
      limit,
      brandId,
      categoryId,
      type,
      minPrice,
      maxPrice,
      hasImage,
      sort,
    });

    fetch(`/api/products?${params}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [], total: 0, page: 1, pages: 0, types: [] }))
      .then((data) => {
        if (cancelled) return;
        const items = withoutExcluded(Array.isArray(data.items) ? data.items.map(serializeProduct) : []);
        const types = Array.isArray(data.types) ? data.types.map(String).filter(Boolean) : [];
        setState({
          items,
          page: Number(data.page || 1),
          pages: Number(data.pages || 0),
          total: Number(data.total || 0),
          types,
          catalogMinPrice: data.minPrice != null ? Number(data.minPrice) : null,
          catalogMaxPrice: data.maxPrice != null ? Number(data.maxPrice) : null,
          loading: false,
          loadingMore: false,
          error: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ ...initial, loading: false, error: true });
      })
      .finally(() => {
        if (!cancelled) busyRef.current = false;
      });

    return () => {
      cancelled = true;
      busyRef.current = false;
    };
  }, [queryKey, enabled, brandId, categoryId, type, limit, minPrice, maxPrice, hasImage, sort, withoutExcluded]);

  const hasMore = state.page > 0 && state.page < state.pages;

  const loadMore = React.useCallback(() => {
    const current = stateRef.current;
    if (!enabled || busyRef.current) return;
    if (!(current.page > 0 && current.page < current.pages) || current.loading || current.loadingMore) return;

    busyRef.current = true;
    const nextPage = current.page + 1;
    setState((prev) => ({ ...prev, loadingMore: true, error: false }));

    const params = buildParams({
      page: nextPage,
      limit,
      brandId,
      categoryId,
      type,
      minPrice,
      maxPrice,
      hasImage,
      sort,
    });

    fetch(`/api/products?${params}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [], total: 0, page: nextPage, pages: 0, types: [] }))
      .then((data) => {
        const items = withoutExcluded(Array.isArray(data.items) ? data.items.map(serializeProduct) : []);
        setState((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            ...items.filter((item: StoreProduct) => !prev.items.some((p) => String(p.id) === String(item.id))),
          ],
          page: Number(data.page || nextPage),
          pages: Number(data.pages || prev.pages),
          total: Number(data.total ?? prev.total),
          loadingMore: false,
          error: false,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loadingMore: false, error: true }));
      })
      .finally(() => {
        busyRef.current = false;
      });
  }, [enabled, brandId, categoryId, type, limit, minPrice, maxPrice, hasImage, sort, withoutExcluded]);

  return {
    products: state.items,
    types: state.types,
    total: state.total,
    catalogMinPrice: state.catalogMinPrice,
    catalogMaxPrice: state.catalogMaxPrice,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore,
    loadMore,
  };
}
