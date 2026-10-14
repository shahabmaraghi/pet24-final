"use client";
import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductBrandMark } from "@/components/product-brand";
import { brandDisplayName, type StoreBrand } from "@/lib/store-brand";
import { useStoreProducts } from "@/lib/use-store-products";

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [brand, setBrand] = React.useState<StoreBrand | null | "loading">("loading");
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);
  const products = useStoreProducts({
    brandId: brand && brand !== "loading" ? brand.id : undefined,
    enabled: Boolean(brand && brand !== "loading"),
  });

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/brands/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => {
        if (res.status === 404) return null;
        return res.ok ? res.json() : Promise.reject(new Error("failed"));
      })
      .then((item) => {
        if (cancelled) return;
        if (item?.id) {
          setBrand({
            id: String(item.id),
            name: String(item.name ?? ""),
            nameFa: String(item.nameFa ?? ""),
            logo: item.logo ? String(item.logo) : "",
            order: Number(item.order || 0),
            active: item.active !== false,
          });
          return;
        }
        setBrand(null);
      })
      .catch(() => {
        if (!cancelled) setBrand(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (brand === "loading") {
    return <div className="py-16 text-center text-muted-foreground">در حال بارگذاری...</div>;
  }
  if (!brand) notFound();

  const types = [...new Set(products.map((p) => p.type).filter(Boolean))];
  const shown = typeFilter ? products.filter((p) => p.type === typeFilter) : products;
  const name = brandDisplayName(brand);

  return (
    <>
      <div className="mb-4 text-[13px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">خانه</Link>
        {" / "}
        <Link href="/#brands" className="hover:text-primary">برندها</Link>
        {" / "}
        {name}
      </div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ProductBrandMark brand={brand} size="lg" />
        </div>
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
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">محصولی از این برند یافت نشد.</div>
      )}
    </>
  );
}
