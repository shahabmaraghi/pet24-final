"use client";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { fmt } from "@/lib/data";
import { useStoreProducts } from "@/lib/use-store-products";
import { ProductImage } from "@/components/product-image";

export default function CartPage() {
  const { cart, incQty, decQty, removeItem } = useCart();
  const products = useStoreProducts();
  const items = cart
    .map((l) => ({ ...l, product: products.find((p) => String(p.id) === String(l.productId)) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => Boolean(l.product));
  const subtotal = items.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  return (
    <>
      <h1 className="mb-6 text-[26px] font-extrabold text-primary">سبد خرید</h1>
      {items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <div className="mb-4">سبد خرید شما خالی است.</div>
          <Button asChild><Link href="/">مشاهده محصولات</Link></Button>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-3.5">
            {items.map((l) => (
              <div key={l.productId} className="grid grid-cols-[56px_1fr_auto_auto] items-center gap-4 rounded-2xl border bg-card p-3.5 sm:grid-cols-[80px_1fr_auto_auto]">
                <ProductImage src={l.product.images?.[0]} alt={l.product.name} className="h-14 w-14 rounded-xl sm:h-16 sm:w-16" />
                <div>
                  <div className="mb-1 text-sm font-bold">{l.product.name}</div>
                  <div className="text-[13px] text-muted-foreground">{fmt(l.product.price)} تومان</div>
                </div>
                <div className="flex items-center rounded-[10px] border">
                  <button onClick={() => decQty(l.productId)} className="flex h-8 w-8 items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                  <div className="w-7 text-center text-[13px] font-bold">{l.qty}</div>
                  <button onClick={() => incQty(l.productId)} className="flex h-8 w-8 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button onClick={() => removeItem(l.productId)} className="text-[13px] font-medium text-destructive">حذف</button>
              </div>
            ))}
          </div>
          <div className="rounded-[18px] border bg-card p-6">
            <div className="mb-3 flex justify-between text-sm text-muted-foreground"><span>جمع کالاها</span><span>{fmt(subtotal)} تومان</span></div>
            <div className="mb-4 flex justify-between text-sm text-muted-foreground"><span>هزینه ارسال</span><span>تعیین در تسویه‌حساب</span></div>
            <div className="mb-5 flex justify-between border-t pt-4 text-[17px] font-extrabold text-primary"><span>جمع کل</span><span>{fmt(subtotal)} تومان</span></div>
            <Button asChild className="w-full py-6 text-[15px] font-bold"><Link href="/checkout">ادامه فرآیند خرید</Link></Button>
          </div>
        </div>
      )}
    </>
  );
}
