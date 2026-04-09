"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  interactive = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800",
            interactive && "cursor-pointer transition-transform hover:scale-110 active:scale-95"
          )}
          onClick={() => interactive && onRatingChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
