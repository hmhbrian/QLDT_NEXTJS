
"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: number; // Kích thước của icon sao (ví dụ: 5 cho h-5 w-5)
  className?: string;
}

export function StarRatingDisplay({
  rating,
  maxStars = 5,
  size = 5,
  className,
}: StarRatingDisplayProps) {
  const fullStars = Math.floor(rating);
  // Một nửa sao được hiển thị nếu phần thập phân là .5 hoặc lớn hơn
  const halfStar = rating % 1 !== 0 && rating - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {" "}
      {/* Điều chỉnh khoảng cách cho các ngôi sao có thể sít hơn */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(`h-${size} w-${size} text-yellow-400 fill-yellow-400`)}
        />
      ))}
      {halfStar && (
        <StarHalf
          className={cn(`h-${size} w-${size} text-yellow-400 fill-yellow-400`)}
        />
      )}
      {/* Đảm bảo emptyStars không âm */}
      {[...Array(emptyStars < 0 ? 0 : emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(`h-${size} w-${size} text-gray-300 dark:text-gray-500`)}
        />
      ))}
    </div>
  );
}

// Export default để có thể dùng với dynamic import
export default StarRatingDisplay;
