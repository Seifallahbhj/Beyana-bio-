import React from "react";

export const ProductSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width || 120}
    height={props.height || 120}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="120" height="120" rx="16" fill="#F3F4F6" />
    <rect x="30" y="40" width="60" height="40" rx="8" fill="#D1D5DB" />
    <rect x="45" y="55" width="30" height="10" rx="3" fill="#9CA3AF" />
    <circle cx="60" cy="80" r="6" fill="#9CA3AF" />
  </svg>
);
