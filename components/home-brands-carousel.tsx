"use client";

import * as React from "react";
import Link from "next/link";
import { brandDisplayName, brandPath, type StoreBrand } from "@/lib/store-brand";

export function HomeBrandsCarousel({ brands }: { brands: StoreBrand[] }) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || brands.length === 0) return;

    let $carousel: JQuery | null = null;
    let cancelled = false;

    const setup = async () => {
      const jqueryModule = await import("jquery");
      const jQuery = (jqueryModule.default ?? jqueryModule) as JQueryStatic;
      window.$ = window.jQuery = jQuery;
      await import("owl.carousel");
      if (cancelled || !rootRef.current) return;
      if (typeof jQuery.fn.owlCarousel !== "function") return;

      $carousel = jQuery(rootRef.current);
      if ($carousel.hasClass("owl-loaded")) {
        $carousel.trigger("destroy.owl.carousel");
      }
      $carousel.owlCarousel({
        rtl: true,
        loop: brands.length > 6,
        margin: 12,
        nav: true,
        dots: true,
        autoplay: brands.length > 6,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        smartSpeed: 450,
        navText: ["‹", "›"],
        responsive: {
          0: { items: 2 },
          480: { items: 3 },
          768: { items: 4 },
          1024: { items: 5 },
          1280: { items: 6 },
        },
      });
    };

    void setup().catch((error) => {
      console.error("Owl carousel failed", error);
    });

    return () => {
      cancelled = true;
      if ($carousel) {
        try {
          $carousel.trigger("destroy.owl.carousel");
        } catch {
          // Owl may already be unmounted
        }
      }
    };
  }, [brands]);

  if (brands.length === 0) return null;

  return (
    <div className="home-brands-owl">
      <div ref={rootRef} className="owl-carousel owl-theme">
        {brands.map((brand) => {
          const name = brandDisplayName(brand);
          return (
            <div key={brand.id} className="h-full">
              <Link
                href={brandPath(brand)}
                className="flex h-full flex-col items-center rounded-[18px] border bg-card px-3 py-5 text-center transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex h-14 w-full items-center justify-center">
                  {brand.logo ? (
                    <img src={brand.logo} alt={name} className="max-h-14 max-w-[85%] object-contain" />
                  ) : (
                    <span className="text-sm font-extrabold text-primary">{name}</span>
                  )}
                </div>
                <div className="text-[13px] font-bold">{name}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
