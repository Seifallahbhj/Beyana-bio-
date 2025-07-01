import React, { forwardRef } from "react";
import { clsx } from "clsx";

// Composant champ de saisie réutilisable

// Props du composant Input
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Label du champ
  error?: string; // Message d'erreur
  helperText?: string; // Texte d'aide
  leftIcon?: React.ReactNode; // Icône à gauche
  rightIcon?: React.ReactNode; // Icône à droite
  fullWidth?: boolean; // Largeur 100%
  variant?: "default" | "filled" | "outlined"; // Style du champ
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = "default",
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      "block w-full rounded-md border transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "placeholder:text-gray-400",
    ];

    const variantClasses = {
      default: [
        "border-gray-300 bg-white text-gray-900",
        "focus:border-primary-green focus:ring-primary-green",
        "hover:border-gray-400",
      ],
      filled: [
        "border-transparent bg-gray-50 text-gray-900",
        "focus:border-primary-green focus:ring-primary-green focus:bg-white",
        "hover:bg-gray-100",
      ],
      outlined: [
        "border-2 border-gray-300 bg-transparent text-gray-900",
        "focus:border-primary-green focus:ring-primary-green",
        "hover:border-gray-400",
      ],
    };

    const errorClasses = error
      ? [
          "border-error-red text-error-red",
          "focus:border-error-red focus:ring-error-red",
        ]
      : [];

    const widthClasses = fullWidth ? "w-full" : "";

    const paddingClasses = leftIcon || rightIcon ? "pl-10 pr-10" : "px-3";

    const inputClasses = clsx(
      baseClasses,
      variantClasses[variant],
      errorClasses,
      widthClasses,
      paddingClasses,
      "py-2",
      className
    );

    return (
      <div className={clsx("space-y-1", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              "block text-sm font-medium text-gray-700",
              error && "text-error-red"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-red"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
