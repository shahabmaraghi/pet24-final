"use client";

import * as React from "react";
import { commentStatusLabel, type VetCommentItem } from "@/lib/store-vet";

export function VetComments() {
  const [items, setItems] = React.useState<VetCommentItem[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/vet/comments", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری نظرها انجام نشد.");
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری نظرها انجام نشد."));
  }, []);

  return (
    <>
      <h1 className="mb-2 text-[22px] font-extrabold text-primary">نظرهای کلینیک</h1>
      <p className="mb-5 text-sm leading-7 text-muted-foreground">
        نظرها را اینجا می‌بینید. فقط مدیر Pet24 می‌تواند آن‌ها را تأیید یا رد کند. نظر تأییدشده در صفحه عمومی کلینیک نمایش داده می‌شود.
      </p>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {items.length === 0 && !error ? <div className="rounded-2xl border bg-card py-10 text-center text-sm text-muted-foreground">هنوز نظری ثبت نشده است.</div> : null}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex justify-between gap-2">
              <strong>{item.authorName}</strong>
              <span className="text-xs font-bold text-[#c17d2f]">{commentStatusLabel(item.status)}</span>
            </div>
            <p className="text-sm leading-7">{item.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
