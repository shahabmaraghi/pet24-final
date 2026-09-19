"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, getCategory, fmt } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import { StarRating } from "@/components/star-rating";
import { baseRating, baseCount } from "@/lib/reviews-store";
import { ProductImage } from "@/components/product-image";

export function ProductCard({ product }: { product: Product }) {
  const cat = getCategory(product.categoryId);
  const { addToCart } = useCart();
  const image = product.images?.[0];
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        <ProductImage src={image} alt={product.name} className="h-44 w-full" iconClassName="h-8 w-8" />
        {product.badge && (
          <Badge className="absolute right-2.5 top-2.5 bg-[#c17d2f] text-white hover:bg-[#c17d2f]">{product.badge}</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="text-xs font-bold text-primary">{cat?.name ?? ""}</div>
        <div className="flex-1 text-sm font-bold leading-relaxed">{product.name}</div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={baseRating(product.id)} size={13} />
          <span className="text-[11px] text-muted-foreground">({baseCount(product.id)})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[15px] font-extrabold text-primary">{fmt(product.price)} تومان</div>
            {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(product.oldPrice)} تومان</div>}
          </div>
          <Button
            size="sm"
            className="h-8 px-3.5 text-xs"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); }}
          >
            افزودن
          </Button>
        </div>
      </div>
    </Link>
  );
}
