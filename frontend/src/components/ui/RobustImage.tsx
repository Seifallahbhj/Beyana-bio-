"use client";

import React, { isValidElement, cloneElement, useState } from "react";
import Image, { ImageProps } from "next/image";

export type RobustImageProps = Omit<ImageProps, "src"> & {
  src?: string | null | undefined;
  fallbackType?: "svg" | "image";
  fallbackSvg?: React.ReactNode;
  fallbackSvgProps?: React.SVGProps<SVGSVGElement>;
  fallbackImageSrc?: string;
};

const DefaultSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width || 120}
    height={props.height || 120}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="120" height="120" rx="16" fill="#F3F4F6" />
    <circle cx="60" cy="60" r="32" fill="#D1D5DB" />
    <text
      x="60"
      y="70"
      textAnchor="middle"
      fill="#9CA3AF"
      fontSize="18"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      Image
    </text>
  </svg>
);

export default function RobustImage({
  src,
  alt,
  fallbackType = "svg",
  fallbackSvg,
  fallbackSvgProps,
  fallbackImageSrc = "/placeholder.png",
  ...props
}: RobustImageProps) {
  const [error, setError] = useState(false);
  const imgSrc = src && src.trim() ? src : null;

  if (!imgSrc || error) {
    if (fallbackType === "svg") {
      return (
        <span
          style={{
            display: "inline-block",
            width: props.width || 120,
            height: props.height || 120,
            background: "#F3F4F6",
            borderRadius: 8,
            ...props.style,
          }}
          className={props.className}
        >
          {isValidElement(fallbackSvg)
            ? cloneElement(fallbackSvg, {
                width: props.width,
                height: props.height,
                ...fallbackSvgProps,
              })
            : fallbackSvg || (
                <DefaultSVG
                  width={props.width}
                  height={props.height}
                  {...fallbackSvgProps}
                />
              )}
        </span>
      );
    } else {
      return <Image {...props} src={fallbackImageSrc} alt={alt} unoptimized />;
    }
  }

  return (
    <Image {...props} src={imgSrc} alt={alt} onError={() => setError(true)} />
  );
}
