import React from "react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = "sm",
  interactive = false,
  onChange,
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const renderStar = (starIndex: number) => {
    const starFill = starIndex <= Math.floor(rating) ? "currentColor" : "none";
    
    return (
      <button
        key={starIndex}
        className={`${interactive ? "cursor-pointer" : "cursor-default"} ${size === "lg" ? "h-10 w-10 rounded-full flex items-center justify-center" : ""}`}
        onClick={() => interactive && onChange && onChange(starIndex)}
        disabled={!interactive}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${sizeClasses[size]} text-[#F5A623]`} 
          viewBox="0 0 20 20" 
          fill={starFill}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default RatingStars;
