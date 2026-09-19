"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

export function ProductImageSlider({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const slides = images.filter(Boolean);
  const [index, setIndex] = React.useState(0);
  const [dragX, setDragX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const startX = React.useRef(0);
  const startY = React.useRef(0);
  const locked = React.useRef<"x" | "y" | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const count = slides.length;
  const current = Math.min(index, Math.max(count - 1, 0));
  const canSlide = count > 1;

  React.useEffect(() => {
    setIndex(0);
    setDragX(0);
  }, [slides.join("|")]);

  const goTo = React.useCallback(
    (next: number) => {
      if (!canSlide) return;
      setIndex((next + count) % count);
      setDragX(0);
    },
    [canSlide, count],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canSlide) return;
    startX.current = event.clientX;
    startY.current = event.clientY;
    locked.current = null;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !canSlide) return;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current !== "x") return;
    event.preventDefault();
    const width = trackRef.current?.clientWidth || 1;
    setDragX(Math.max(-width * 0.85, Math.min(width * 0.85, dx)));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const width = trackRef.current?.clientWidth || 1;
    const threshold = Math.min(80, width * 0.18);
    if (dragX <= -threshold) goTo(current + 1);
    else if (dragX >= threshold) goTo(current - 1);
    else setDragX(0);
    locked.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canSlide) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current + 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current - 1);
    }
  };

  if (count === 0) {
    return (
      <div className="flex h-[420px] overflow-hidden rounded-[20px] border bg-muted">
        <ProductImage alt={alt} className="h-full w-full" iconClassName="h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        className="group relative h-[420px] touch-pan-y overflow-hidden rounded-[20px] border bg-muted select-none outline-none"
        tabIndex={canSlide ? 0 : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={cn("flex h-full", dragging ? "transition-none" : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]")}
          style={{
            direction: "ltr",
            transform: `translateX(calc(-${current * 100}% + ${dragX}px))`,
          }}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="h-full w-full shrink-0" dir="rtl">
              <ProductImage src={src} alt={i === current ? alt : ""} className="pointer-events-none h-full w-full" />
            </div>
          ))}
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              aria-label="تصویر قبلی"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(current - 1)}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm opacity-100 transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(current + 1)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm opacity-100 transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="absolute left-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              {current + 1} / {count}
            </div>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`تصویر ${i + 1}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {canSlide && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((src, i) => (
            <button
              key={`${src}-thumb-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 transition",
                i === current
                  ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_28%,transparent)]"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={src} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
