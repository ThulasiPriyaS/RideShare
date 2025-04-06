import React from "react";

interface BadgeIconProps {
  icon: React.ReactNode;
  color: string;
  shine?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const BadgeIcon: React.FC<BadgeIconProps> = ({
  icon,
  color,
  shine = false,
  pulse = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };

  return (
    <div className={`relative ${shine ? 'badge-shine' : ''}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
          pulse ? 'pulse' : ''
        }`}
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </div>
  );
};

export default BadgeIcon;
