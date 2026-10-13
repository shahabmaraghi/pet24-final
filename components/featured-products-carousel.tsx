"use client";

import * as React from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export function FeaturedProductsCarousel({
  products,
  emptyMessage = "محصولی برای نمایش وجود ندارد.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || products.length === 0) return;

    let $carousel: JQuery | null = null;
    let cancelled = false;

    const setup = async () => {
      const jqueryModule = await import("jquery/dist/jquery.js");
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
        loop: products.length > 4,
        margin: 16,
        nav: true,
        dots: true,
        autoplay: products.length > 4,
        autoplayTimeout: 4500,
        autoplayHoverPause: true,
        smartSpeed: 450,
        navText: ["‹", "›"],
        responsive: {
          0: { items: 2 },
          640: { items: 3 },
          1024: { items: 4 },
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
  }, [products]);

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="featured-products-owl">
      <div ref={rootRef} className="owl-carousel owl-theme">
        {products.map((product) => (
          <div key={String(product.id)} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
