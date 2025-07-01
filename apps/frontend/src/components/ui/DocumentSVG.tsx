import React from "react";

export const DocumentSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width || 100}
    height={props.height || 100}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="20" y="15" width="60" height="70" rx="8" fill="#F3F4F6" />
    <rect x="28" y="25" width="44" height="8" rx="2" fill="#D1D5DB" />
    <rect x="28" y="40" width="44" height="8" rx="2" fill="#D1D5DB" />
    <rect x="28" y="55" width="30" height="8" rx="2" fill="#E5E7EB" />
    <rect x="28" y="70" width="20" height="8" rx="2" fill="#E5E7EB" />
    <text
      x="50"
      y="90"
      textAnchor="middle"
      fill="#9CA3AF"
      fontSize="14"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      Document
    </text>
  </svg>
);
