"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/data";

function normalize(items: unknown): Category[] | null {
  if (!Array.isArray(items)) return null;
  return items.map((item) => ({
    id: String(item.id),
    name: String(item.name),
    tint: String(item.tint || "#6b7280"),
  }));
}

async function loadCategories() {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const next = normalize(await res.json());
      if (next) return next;
      throw new Error("invalid");
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

export function useStoreCategories() {
  const pathname = usePathname();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    loadCategories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return categories;
}
