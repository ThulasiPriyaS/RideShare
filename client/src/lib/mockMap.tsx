import React from "react";

interface MapProps {
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

const MockMap: React.FC<MapProps> = ({ 
  height = "h-48", 
  className = "", 
  children 
}) => {
  return (
    <div className={`relative ${height} rounded-xl shadow-sm ${className}`}>
      <div className="map-container h-full w-full rounded-xl"></div>
      {children}
    </div>
  );
};

export default MockMap;
