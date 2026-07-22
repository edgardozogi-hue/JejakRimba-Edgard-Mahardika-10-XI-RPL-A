"use client";

import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 14,
  interactive = false,
  onChange,
}: {
  rating?: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const val = i + 1;
        const filled = val <= Math.floor(rating);
        const half = !filled && val - 0.5 <= rating;

        return (
          <button
            key={val}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(val)}
            className={`${interactive ? "cursor-pointer transition hover:scale-110 active:scale-90" : "cursor-default"} ${interactive && val <= rating ? "scale-110" : ""}`}
            aria-label={`${val} bintang`}
          >
            <Star
              size={size}
              fill={filled ? "currentColor" : half ? "currentColor" : "none"}
              strokeWidth={filled ? 0 : half ? 0 : 1.5}
              className={
                filled
                  ? "text-amber-400"
                  : half
                    ? "text-amber-400"
                    : "text-text-secondary/40"
              }
              style={
                half && !filled
                  ? { clipPath: "inset(0 50% 0 0)" }
                  : undefined
              }
            />
          </button>
        );
      })}
    </span>
  );
}
