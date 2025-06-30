import React from "react";
import { clsx } from "clsx";

// Composant bouton réutilisable avec plusieurs variantes et options

// Props du composant Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"; // Style du bouton
  size?: "sm" | "md" | "lg"; // Taille
  loading?: boolean; // Affiche un spinner si true
  icon?: React.ReactNode; // Icône à afficher
  iconPosition?: "left" | "right"; // Position de l'icône
  fullWidth?: boolean; // Largeur 100%
  children: React.ReactNode; // Contenu du bouton
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    "inline-flex items-center justify-center font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "rounded-md border",
  ];

  const variantClasses = {
    primary: [
      "bg-primary-green text-white border-primary-green",
      "hover:bg-secondary-green hover:border-secondary-green",
      "focus:ring-primary-green",
    ],
    secondary: [
      "bg-accent-gold text-white border-accent-gold",
      "hover:bg-yellow-600 hover:border-yellow-600",
      "focus:ring-accent-gold",
    ],
    outline: [
      "bg-transparent text-primary-green border-primary-green",
      "hover:bg-primary-green hover:text-white",
      "focus:ring-primary-green",
    ],
    ghost: [
      "bg-transparent text-text-light border-transparent",
      "hover:bg-muted hover:text-text-dark",
      "focus:ring-primary-green",
    ],
    danger: [
      "bg-error-red text-white border-error-red",
      "hover:bg-red-700 hover:border-red-700",
      "focus:ring-error-red",
    ],
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  );

  const isDisabled = disabled || loading;

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}

      <span className={loading ? "opacity-0" : ""}>{children}</span>

      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
