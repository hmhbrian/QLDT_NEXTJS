"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  maxStars?: number;
  size?: number; // Kích thước của icon sao
  className?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  rating,
  setRating,
  maxStars = 5,
  size = 8, // Tăng kích thước mặc định
  className,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <button
            type="button"
            key={starValue}
            onClick={() => !disabled && setRating(starValue)}
            onMouseEnter={() => !disabled && setHoverRating(starValue)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={cn(
              "p-1 rounded-lg transition-all duration-200 transform",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive && !disabled && "drop-shadow-md"
            )}
            aria-label={`Đánh giá ${starValue} trên ${maxStars} sao`}
            disabled={disabled}
          >
            <Star
              className={cn(
                `h-${size} w-${size}`,
                isActive
                  ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                  : "text-gray-300 dark:text-gray-600",
                "transition-all duration-200",
                !disabled &&
                  !isActive &&
                  "hover:text-amber-300 hover:fill-amber-300/50",
                !disabled &&
                  isActive &&
                  "hover:text-amber-300 hover:fill-amber-300"
              )}
            />
          </button>
        );
      })}

      {/* Hiển thị số điểm hiện tại */}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {rating}/{maxStars}
        </span>
      )}
    </div>
  );
}
