"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

export default function AccountRecentPage() {
  const [recent, setRecent] = React.useState<Product[]>([]);
  const [busy, setBusy] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/recently-viewed", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        setRecent(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1 className="mb-5 text-[22px] font-extrabold text-primary">بازدیدهای اخیر</h1>
      {busy ? (
        <div className="py-12 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>
      ) : recent.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          هنوز محصولی بازدید نکرده‌اید.
          <div className="mt-4">
            <Button asChild className="font-bold"><Link href="/">مشاهده محصولات</Link></Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recent.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
