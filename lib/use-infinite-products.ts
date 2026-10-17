"use client";

import * as React from "react";
import { serializeProduct, type StoreProduct } from "@/lib/store-product";

type Options = {
  brandId?: string;
  categoryId?: string;
  type?: string | null;
  excludeId?: string;
  limit?: number;
  enabled?: boolean;
};

type State = {
  items: StoreProduct[];
  page: number;
  pages: number;
  total: number;
  types: string[];
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
  loading: true,
  loadingMore: false,
  error: false,
};

export function useInfiniteProducts(options: Options) {
  const { brandId, categoryId, type, excludeId, limit = 24, enabled = true } = options;
  const [state, setState] = React.useState<State>(initial);
  const busyRef = React.useRef(false);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const queryKey = `${brandId || ""}|${categoryId || ""}|${type || ""}|${excludeId || ""}|${limit}|${enabled}`;

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

    const params = new URLSearchParams({ page: "1", limit: String(limit) });
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);
    if (type) params.set("type", type);

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
  }, [queryKey, enabled, brandId, categoryId, type, limit, withoutExcluded]);

  const hasMore = state.page > 0 && state.page < state.pages;

  const loadMore = React.useCallback(() => {
    const current = stateRef.current;
    if (!enabled || busyRef.current) return;
    if (!(current.page > 0 && current.page < current.pages) || current.loading || current.loadingMore) return;

    busyRef.current = true;
    const nextPage = current.page + 1;
    setState((prev) => ({ ...prev, loadingMore: true, error: false }));

    const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) });
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);
    if (type) params.set("type", type);

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
  }, [enabled, brandId, categoryId, type, limit, withoutExcluded]);

  return {
    products: state.items,
    types: state.types,
    total: state.total,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore,
    loadMore,
  };
}
