"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { StoreFaq } from "@/lib/store-faq";

export function HomeFaq({ items }: { items: StoreFaq[] }) {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null);

  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-2 text-[22px] font-extrabold text-primary">سؤالات متداول</h2>
      <p className="mb-5 text-[13px] text-muted-foreground">پاسخ پرسش‌های پرتکرار درباره خرید، ارسال و خدمات Pet24.</p>
      <div className="overflow-hidden rounded-3xl border bg-card">
        {items.map((item, index) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className={index > 0 ? "border-t" : ""}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
                aria-expanded={open}
              >
                <span className="text-[15px] font-extrabold text-primary">{item.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="px-5 pb-4 text-[13px] leading-7 text-muted-foreground">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
