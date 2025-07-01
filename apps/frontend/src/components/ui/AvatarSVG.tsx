import React from "react";

export default function AvatarSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
      <circle cx="32" cy="26" r="14" fill="#A3A3A3" />
      <ellipse cx="32" cy="50" rx="18" ry="10" fill="#A3A3A3" />
    </svg>
  );
}
