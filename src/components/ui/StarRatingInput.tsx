import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  totalStars?: number;
  className?: string;
  size?: number;
}

const StarRatingInput = ({
  rating,
  setRating,
  totalStars = 5,
  className,
  size = 6,
}: StarRatingInputProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              className="hidden"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
            />
            <Star
              className={`cursor-pointer ${
                ratingValue <= (hover || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              size={size}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
