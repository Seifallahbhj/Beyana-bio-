import React from "react";

export const CategorySVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width || 100}
    height={props.height || 100}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="10" y="30" width="80" height="50" rx="10" fill="#F3F4F6" />
    <rect x="10" y="20" width="40" height="20" rx="6" fill="#D1D5DB" />
    <rect x="55" y="20" width="35" height="15" rx="5" fill="#E5E7EB" />
    <text
      x="50"
      y="65"
      textAnchor="middle"
      fill="#9CA3AF"
      fontSize="16"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      Catégorie
    </text>
  </svg>
);
