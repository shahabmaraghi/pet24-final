"use client";

import * as React from "react";
import { fmt } from "@/lib/data";

type WishlistItem = { id: number; name: string; categoryName: string; price: number };

export default function AccountWishlistPage() {
  const [wishlist, setWishlist] = React.useState<WishlistItem[]>([]);

  return (
    <>
      <h1 className="mb-5 text-[22px] font-extrabold text-primary">علاقه‌مندی‌ها</h1>
      {wishlist.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">لیست علاقه‌مندی‌ها خالی است.</div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {wishlist.map((w) => (
            <div key={w.id} className="rounded-2xl border bg-card p-4">
              <div className="mb-1.5 text-xs font-bold text-primary">{w.categoryName}</div>
              <div className="mb-2.5 text-sm font-bold">{w.name}</div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-primary">{fmt(w.price)} تومان</span>
                <button onClick={() => setWishlist((ws) => ws.filter((x) => x.id !== w.id))} className="text-[13px] text-destructive">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
