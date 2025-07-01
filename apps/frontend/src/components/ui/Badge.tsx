import React from "react";
import { clsx } from "clsx";

// Composant badge réutilisable pour afficher un label ou un statut

// Props du composant Badge
export interface BadgeProps {
  children: React.ReactNode; // Contenu du badge
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline"; // Style du badge
  size?: "sm" | "md" | "lg"; // Taille
  rounded?: boolean; // Bords arrondis
  className?: string; // Classes CSS additionnelles
  icon?: React.ReactNode; // Icône à afficher
  removable?: boolean; // Affichable avec bouton de suppression
  onRemove?: () => void; // Callback suppression
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  rounded = false,
  className,
  icon,
  removable = false,
  onRemove,
}) => {
  const baseClasses = [
    "inline-flex items-center font-medium transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
  ];

  const variantClasses = {
    primary: ["bg-primary-green text-white", "focus:ring-primary-green"],
    secondary: ["bg-accent-gold text-white", "focus:ring-accent-gold"],
    success: ["bg-success-green text-white", "focus:ring-success-green"],
    warning: ["bg-warning-orange text-white", "focus:ring-warning-orange"],
    error: ["bg-error-red text-white", "focus:ring-error-red"],
    info: ["bg-info-blue text-white", "focus:ring-info-blue"],
    outline: [
      "bg-transparent border border-primary-green text-primary-green",
      "focus:ring-primary-green",
    ],
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const roundedClasses = rounded ? "rounded-full" : "rounded-md";

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses,
    className
  );

  return (
    <span className={classes}>
      {icon && <span className="mr-1.5 h-3 w-3">{icon}</span>}

      <span>{children}</span>

      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={clsx(
            "ml-1.5 inline-flex h-3 w-3 items-center justify-center rounded-full",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "hover:bg-black hover:bg-opacity-20",
            "transition-colors duration-200"
          )}
          aria-label="Remove badge"
        >
          <svg
            className="h-2 w-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Composants spécialisés pour des cas d'usage spécifiques
export const StatusBadge: React.FC<{
  status: "active" | "inactive" | "pending" | "completed";
}> = ({ status }) => {
  const statusConfig = {
    active: { variant: "success" as const, text: "Actif" },
    inactive: { variant: "error" as const, text: "Inactif" },
    pending: { variant: "warning" as const, text: "En attente" },
    completed: { variant: "success" as const, text: "Terminé" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size="sm">
      {config.text}
    </Badge>
  );
};

export const CertificationBadge: React.FC<{
  type: "bio" | "organic" | "fair-trade" | "local";
}> = ({ type }) => {
  const certificationConfig = {
    bio: { variant: "success" as const, text: "Bio", icon: "🌱" },
    organic: { variant: "success" as const, text: "Organique", icon: "🍃" },
    "fair-trade": {
      variant: "info" as const,
      text: "Commerce Équitable",
      icon: "🤝",
    },
    local: { variant: "primary" as const, text: "Local", icon: "🏠" },
  };

  const config = certificationConfig[type];

  return (
    <Badge variant={config.variant} size="sm" icon={config.icon}>
      {config.text}
    </Badge>
  );
};

export default Badge;
