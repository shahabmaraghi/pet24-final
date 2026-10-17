"use client";
import * as React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ImageIcon } from "lucide-react";
import type { StoreSlide } from "@/lib/store-slide";

export const INTRO_SLIDE: StoreSlide = {
  id: "intro",
  catId: "dog",
  tag: "فروشگاه کامل لوازم حیوانات خانگی",
  title: "هر چیزی که دوست کوچولوی شما نیاز دارد",
  subtitle: "از غذا و اسباب‌بازی گرفته تا دارو، قفس و حتی خرید حیوان خانگی؛ Pet24 با ضمانت اصالت کالا و ارسال سریع در کنار شماست.",
  from: "#f0ece1",
  to: "#e9f1ea",
  image: "",
  order: -1,
};

function withIntro(items: StoreSlide[]) {
  return [INTRO_SLIDE, ...items.filter((slide) => slide.id !== "intro")];
}

function mapApiSlide(item: {
  _id?: string;
  id?: string;
  catId?: string;
  tag?: string;
  title: string;
  subtitle?: string;
  from?: string;
  to?: string;
  image?: string;
}): StoreSlide {
  return {
    id: String(item.id || item._id),
    catId: String(item.catId || "dog"),
    tag: String(item.tag || "ویژه"),
    title: String(item.title),
    subtitle: String(item.subtitle || ""),
    from: String(item.from || "#f0ece1"),
    to: String(item.to || item.from || "#e9f1ea"),
    image: item.image ? String(item.image) : "",
    order: 0,
  };
}

export function HeroSlider({ initialSlides = [] }: { initialSlides?: StoreSlide[] }) {
  const [slides, setSlides] = React.useState<StoreSlide[]>(() => withIntro(initialSlides));
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/slider", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items) || items.length === 0) return;
        setSlides(withIntro(items.map(mapApiSlide)));
        setIndex(0);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ direction: "ltr", transform: `translateX(-${index * 100}%)` }}>
        {slides.map((sl) => (
          <div
            key={sl.id}
            dir="rtl"
            className="w-full shrink-0 px-6 py-10 sm:px-10 sm:py-14 lg:px-16"
            style={{ background: `linear-gradient(135deg, ${sl.from || "#f0ece1"}, ${sl.to || sl.from || "#e9f1ea"})` }}
          >
            <div className="mx-auto grid w-full max-w-[1280px] items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="text-center md:text-right">
                <span className="mb-4 inline-block rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground">
                  {sl.tag}
                </span>
                <h2 className="mb-4 text-[26px] font-extrabold leading-relaxed text-primary sm:text-4xl">
                  {sl.title}
                </h2>
                <p className="mb-7 text-[15px] leading-loose text-muted-foreground sm:text-base">
                  {sl.subtitle}
                </p>
                <Link
                  href={`/category/${sl.catId}`}
                  className="inline-block rounded-2xl bg-primary px-8 py-3.5 text-[15px] font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                  مشاهده محصولات
                </Link>
              </div>
              {sl.image ? (
                <img
                  src={sl.image}
                  alt={sl.title}
                  className="h-[220px] w-full rounded-[20px] object-cover sm:h-[280px]"
                />
              ) : (
                <div className="flex h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed bg-muted text-muted-foreground sm:h-[280px]">
                  <ImageIcon className="h-14 w-14" strokeWidth={1.4} />
                  <span className="mt-2.5 text-[13px]">تصویر بنر اصلی</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="اسلاید قبلی"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md hover:bg-accent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="اسلاید بعدی"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-md hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((sl, i) => (
              <span
                key={sl.id}
                onClick={() => setIndex(i)}
                className="h-2 cursor-pointer rounded-full transition-all"
                style={{
                  width: i === index ? 22 : 8,
                  background: i === index ? "var(--primary)" : "color-mix(in oklab, var(--primary) 28%, white)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
