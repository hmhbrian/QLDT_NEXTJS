
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  size = 5, 
  className,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            onClick={() => !disabled && setRating(starValue)}
            className={cn(
              "p-0.5 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              disabled ? "cursor-not-allowed" : "cursor-pointer group"
            )}
            aria-label={`Rate ${starValue} out of ${maxStars} stars`}
            disabled={disabled}
          >
            {/* Icon ngôi sao */}
            <Star
              className={cn(
                `h-${size} w-${size}`,
                starValue <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 group-hover:text-yellow-200 dark:text-gray-600 dark:group-hover:text-yellow-300/70',
                'transition-colors duration-150'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

