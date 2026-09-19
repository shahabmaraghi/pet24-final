"use client";
import * as React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type StoreSlide = {
  id: string;
  catId: string;
  tag: string;
  title: string;
  subtitle: string;
  from: string;
  to: string;
};

export function HeroSlider() {
  const [slides, setSlides] = React.useState<StoreSlide[]>([]);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/slider", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        setSlides(items.map((item: { _id?: string; id?: string; catId?: string; tag?: string; title: string; subtitle?: string; from?: string; to?: string }) => ({
          id: String(item.id || item._id),
          catId: String(item.catId || "dog"),
          tag: String(item.tag || "ویژه"),
          title: String(item.title),
          subtitle: String(item.subtitle || ""),
          from: String(item.from || "#3f7a5c"),
          to: String(item.to || "#1f4d38"),
        })));
        setIndex(0);
      })
      .catch(() => setSlides([]));
  }, []);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative mb-8 overflow-hidden rounded-3xl shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ direction: "ltr", transform: `translateX(-${index * 100}%)` }}>
        {slides.map((sl) => (
          <div
            key={sl.id}
            dir="rtl"
            className="flex min-h-[260px] w-full shrink-0 items-center p-12"
            style={{ background: `linear-gradient(135deg,${sl.from},${sl.to})` }}
          >
            <div>
              <span className="mb-3.5 inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white">{sl.tag}</span>
              <h2 className="mb-2.5 text-2xl font-extrabold text-white sm:text-[28px]">{sl.title}</h2>
              <p className="mb-5 max-w-[360px] text-sm text-white/90">{sl.subtitle}</p>
              <Button asChild className="rounded-xl bg-white px-6 py-5 font-bold text-primary hover:bg-white/90">
                <Link href={`/category/${sl.catId}`}>مشاهده محصولات</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="اسلاید قبلی"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="اسلاید بعدی"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((sl, i) => (
          <span
            key={sl.id}
            onClick={() => setIndex(i)}
            className="h-2 cursor-pointer rounded-full bg-white/50 transition-all"
            style={{ width: i === index ? 22 : 8, background: i === index ? "#fff" : "rgba(255,255,255,0.5)" }}
          />
        ))}
      </div>
    </div>
  );
}
