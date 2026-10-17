import { brandDisplayName } from "@/lib/store-brand";
import { cn } from "@/lib/utils";
import type { ProductBrand } from "@/lib/data";

export function ProductBrandMark({
  brand,
  className,
  size = "sm",
}: {
  brand?: ProductBrand | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!brand) return null;
  const label = brandDisplayName(brand);
  if (!label && !brand.logo) return null;
  const english = brand.name.trim();
  const showEnglish = Boolean(english && english !== label);

  if (size === "lg") {
    return (
      <div className={cn("inline-flex max-w-full items-center gap-3 rounded-2xl border bg-card px-3 py-2.5 shadow-sm", className)}>
        {brand.logo ? (
          <div className="flex h-14 w-[5.5rem] shrink-0 items-center justify-center rounded-xl border border-border bg-muted p-1.5">
            <img src={brand.logo} alt={label} className="max-h-full max-w-full object-contain" />
          </div>
        ) : null}
        <div className="min-w-0 text-right">
          <div className="mb-0.5 text-[11px] font-bold tracking-wide text-muted-foreground">برند</div>
          {label ? <div className="text-[17px] font-extrabold leading-tight text-foreground">{label}</div> : null}
          {showEnglish ? (
            <div className="mt-0.5 text-[12px] font-semibold text-muted-foreground" dir="ltr">
              {english}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border bg-card px-1.5 py-1", className)}>
      {brand.logo ? (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted",
            size === "md" ? "h-10 w-[4.25rem]" : "h-8 w-14"
          )}
        >
          <img src={brand.logo} alt="" className="h-full w-full object-contain" />
        </div>
      ) : null}
      {label ? (
        <span className={cn("truncate font-extrabold text-foreground", size === "md" ? "text-[13px]" : "text-[11px]")}>
          {label}
        </span>
      ) : null}
    </div>
  );
}
