"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import type { StoreProduct } from "@/lib/store-product";

type SuggestedItem = { product: StoreProduct; why: string };
type Plan = {
  food: SuggestedItem[];
  accessories: SuggestedItem[];
  reasons: string[];
  categoryId: string;
  matchLabel: string;
};

function ProductGrid({ items }: { items: SuggestedItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
      {items.map((item) => (
        <div key={String(item.product.id)} className="flex min-w-0 flex-col gap-2">
          <div className="break-words rounded-[10px] bg-accent px-2.5 py-1.5 text-[11px] font-semibold leading-5 text-primary">{item.why}</div>
          <ProductCard product={item.product} />
        </div>
      ))}
    </div>
  );
}

export function PetSuggestionPlan({ petId, petName }: { petId: string; petName: string }) {
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    fetch(`/api/pets/${petId}/suggestions`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری پیشنهادها انجام نشد.");
        if (!cancelled) setPlan(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "بارگذاری پیشنهادها انجام نشد.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [petId]);

  return (
    <section className="mb-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-primary">پیشنهاد خرید برای {petName}</h2>
        {plan?.categoryId ? (
          <Button asChild variant="outline" className="h-9 shrink-0 font-bold">
            <Link href={`/category/${plan.categoryId}`}>دیدن همه محصولات این گونه</Link>
          </Button>
        ) : null}
      </div>
      <p className="mb-4 text-[13px] text-muted-foreground">
        از کالاهای واقعی فروشگاه، غذا و لوازم مناسب نژاد و جثه این حیوان انتخاب شده است. هر کارت دلیل پیشنهاد را نشان می‌دهد و می‌توانید همان‌جا به سبد اضافه کنید.
      </p>
      {busy ? (
        <div className="rounded-2xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">در حال انتخاب از فروشگاه...</div>
      ) : error ? (
        <div className="rounded-2xl border bg-card px-5 py-10 text-center text-sm text-destructive">{error}</div>
      ) : !plan || (plan.food.length === 0 && plan.accessories.length === 0) ? (
        <div className="rounded-2xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          محصول مناسبی برای این نژاد در فروشگاه پیدا نشد.
        </div>
      ) : (
        <>
          {plan.matchLabel && (
            <div className="mb-3 text-sm font-bold text-primary">تطبیق نژاد: {plan.matchLabel}</div>
          )}
          {plan.reasons.length > 0 && (
            <ul className="mb-5 space-y-2 rounded-2xl border bg-card p-4 text-[13px] leading-7 text-muted-foreground">
              {plan.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          )}
          {plan.food.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-extrabold text-primary">غذای مناسب این نژاد</h3>
              <ProductGrid items={plan.food} />
            </div>
          )}
          {plan.accessories.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-primary">لوازم مناسب این نژاد</h3>
              <ProductGrid items={plan.accessories} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
