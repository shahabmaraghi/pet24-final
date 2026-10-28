"use client";

import * as React from "react";
import { Image as ImageIcon, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { PriceRangeSlider } from "@/components/price-range-slider";
import type { ImageFilter, ProductSort } from "@/lib/use-infinite-products";

export const SORT_OPTIONS: { id: ProductSort; label: string }[] = [
  { id: "newest", label: "جدیدترین" },
  { id: "oldest", label: "قدیمی‌ترین" },
  { id: "price_asc", label: "ارزان‌ترین" },
  { id: "price_desc", label: "گران‌ترین" },
  { id: "name", label: "نام (الفبا)" },
];

const IMAGE_OPTIONS: { id: ImageFilter; label: string }[] = [
  { id: "all", label: "همه محصولات" },
  { id: "with", label: "فقط با تصویر" },
  { id: "without", label: "بدون تصویر" },
];

function formatFa(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("fa-IR");
}

export function CategorySortSelect({
  value,
  onChange,
}: {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px]">
      <span className="font-semibold text-muted-foreground">مرتب‌سازی</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="h-10 rounded-xl border bg-card px-3 text-[13px] font-semibold text-foreground outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CategoryFilterPanel({
  types,
  typeFilter,
  minPrice,
  maxPrice,
  hasImage,
  catalogMinPrice,
  catalogMaxPrice,
  onTypeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onHasImageChange,
  onClear,
}: {
  types: string[];
  typeFilter: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  hasImage: ImageFilter;
  catalogMinPrice: number | null;
  catalogMaxPrice: number | null;
  onTypeChange: (value: string | null) => void;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  onHasImageChange: (value: ImageFilter) => void;
  onClear: () => void;
}) {
  const boundMin = catalogMinPrice != null && Number.isFinite(catalogMinPrice) ? catalogMinPrice : 0;
  const boundMax =
    catalogMaxPrice != null && Number.isFinite(catalogMaxPrice) && catalogMaxPrice > boundMin
      ? catalogMaxPrice
      : boundMin + 100000;
  const [draftMin, setDraftMin] = React.useState(minPrice ?? boundMin);
  const [draftMax, setDraftMax] = React.useState(maxPrice ?? boundMax);
  const active =
    Boolean(typeFilter) ||
    (minPrice != null && minPrice > boundMin) ||
    (maxPrice != null && maxPrice < boundMax) ||
    hasImage !== "all";

  React.useEffect(() => {
    setDraftMin(minPrice ?? boundMin);
    setDraftMax(maxPrice ?? boundMax);
  }, [minPrice, maxPrice, boundMin, boundMax]);

  const commitPrice = (next: { min: number; max: number }) => {
    onMinPriceChange(next.min <= boundMin ? null : next.min);
    onMaxPriceChange(next.max >= boundMax ? null : next.max);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-[#d7e4dc] bg-[linear-gradient(180deg,#f3faf6_0%,#eef6f1_48%,#e8f2ec_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="flex items-center justify-between gap-2 border-b border-[#d0dfd6] bg-[#16342c] px-3.5 py-3 text-[#f3faf6]">
        <div className="flex items-center gap-2 text-[13px] font-extrabold">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
          فیلترها
        </div>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setDraftMin(boundMin);
              setDraftMax(boundMax);
              onClear();
            }}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/15"
          >
            <X className="h-3 w-3" />
            پاک کردن
          </button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {types.length > 0 ? (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#2f5a49]">
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.8} />
              نوع محصول
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onTypeChange(null)}
                className={`rounded-xl px-3 py-2 text-start text-[12.5px] font-semibold transition-colors ${
                  !typeFilter
                    ? "bg-[#16342c] text-white"
                    : "bg-white/70 text-[#3d5f51] ring-1 ring-[#c9dbd1] hover:bg-white"
                }`}
              >
                همه انواع
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onTypeChange(typeFilter === type ? null : type)}
                  className={`rounded-xl px-3 py-2 text-start text-[12.5px] font-semibold transition-colors ${
                    typeFilter === type
                      ? "bg-[#16342c] text-white"
                      : "bg-white/70 text-[#3d5f51] ring-1 ring-[#c9dbd1] hover:bg-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white/65 p-3 ring-1 ring-[#c9dbd1]">
          <div className="mb-1 text-[12px] font-bold text-[#2f5a49]">بازه قیمت (تومان)</div>
          <p className="mb-2 text-[11px] text-[#6f8a7d]">
            از {formatFa(boundMin) || "۰"} تا {formatFa(boundMax) || "—"}
          </p>
          <PriceRangeSlider
            min={boundMin}
            max={boundMax}
            valueMin={draftMin}
            valueMax={draftMax}
            step={Math.max(1000, Math.round((boundMax - boundMin) / 100) || 10000)}
            onChange={(next) => {
              setDraftMin(next.min);
              setDraftMax(next.max);
            }}
            onCommit={commitPrice}
          />
        </div>

        <div className="mt-auto">
          <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#2f5a49]">
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
            تصویر محصول
          </div>
          <div className="flex flex-col gap-1">
            {IMAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onHasImageChange(option.id)}
                className={`rounded-xl px-3 py-2 text-start text-[12.5px] font-semibold transition-colors ${
                  hasImage === option.id
                    ? "bg-[#16342c] text-white"
                    : "bg-white/70 text-[#3d5f51] ring-1 ring-[#c9dbd1] hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
