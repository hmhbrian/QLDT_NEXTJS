import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
  className?: string;
  size?: number;
}

const StarRatingDisplay = ({
  rating,
  totalStars = 5,
  className,
  size = 5,
}: StarRatingDisplayProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          size={size}
        />
      ))}
    </div>
  );
};

export default StarRatingDisplay;
