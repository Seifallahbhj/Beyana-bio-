import React from "react";
import { clsx } from "clsx";

// Composant carte réutilisable pour l'affichage de contenu

// Props du composant Card
export interface CardProps {
  children: React.ReactNode; // Contenu de la carte
  className?: string; // Classes CSS additionnelles
  padding?: "none" | "sm" | "md" | "lg"; // Padding
  shadow?: "none" | "sm" | "md" | "lg"; // Ombre
  hover?: boolean; // Effet hover
  border?: boolean; // Affiche une bordure
  onClick?: () => void; // Callback au clic
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "md",
  hover = false,
  border = true,
  onClick,
}) => {
  const baseClasses = [
    "bg-white rounded-lg transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2",
  ];

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const borderClasses = border ? "border border-gray-200" : "";

  const hoverClasses = hover
    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "";

  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClasses,
    hoverClasses,
    className
  );

  const Component = onClick ? "button" : "div";

  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
};

// Sous-composants pour une meilleure organisation
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={clsx("flex items-center justify-between mb-4", className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h3 className={clsx("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={clsx("", className)}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={clsx(
      "flex items-center justify-between mt-4 pt-4 border-t border-gray-200",
      className
    )}
  >
    {children}
  </div>
);

export default Card;
