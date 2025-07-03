
import React from 'react';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
  size?: string;  // Add size property
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readOnly = false,
  className,
  size
}) => {
  const stars = [1, 2, 3, 4, 5];
  
  const handleClick = (value: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const getStarSize = () => {
    switch(size) {
      case 'small': return 'h-4 w-4';
      case 'large': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          className={cn(
            "cursor-pointer transition-all",
            !readOnly && "hover:scale-110"
          )}
        >
          {rating >= star ? (
            <Star className={cn(getStarSize(), "text-nail-gold")} fill="currentColor" />
          ) : rating >= star - 0.5 ? (
            <StarHalf className={cn(getStarSize(), "text-nail-gold")} fill="currentColor" />
          ) : (
            <StarOff className={cn(getStarSize(), "text-gray-300")} />
          )}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
