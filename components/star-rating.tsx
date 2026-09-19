"use client";
import { Star } from "lucide-react";

export function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="text-[#c17d2f]"
            aria-label={`امتیاز ${n} از ۵`}
          >
            <Star style={{ width: size, height: size }} className={n <= rating ? "fill-current" : "fill-none"} />
          </button>
        ) : (
          <Star
            key={n}
            style={{ width: size, height: size }}
            className={n <= Math.round(rating) ? "fill-current text-[#c17d2f]" : "fill-none text-[#c17d2f]/40"}
          />
        )
      )}
    </div>
  );
}
