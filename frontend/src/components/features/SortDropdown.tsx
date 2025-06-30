"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// Composant SortDropdown : menu déroulant pour trier les produits

// Option de tri
interface SortOption {
  value: string; // Valeur du tri
  label: string; // Label affiché
}

// Props du composant SortDropdown
interface SortDropdownProps {
  value: string; // Valeur sélectionnée
  onChange: (value: string) => void; // Callback lors du changement
  className?: string; // Classes CSS additionnelles
}

const sortOptions: SortOption[] = [
  { value: "-createdAt", label: "Plus récents" },
  { value: "createdAt", label: "Plus anciens" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix décroissant" },
  { value: "-rating", label: "Mieux notés" },
  { value: "name", label: "Nom A-Z" },
  { value: "-name", label: "Nom Z-A" },
];

export default function SortDropdown({
  value,
  onChange,
  className = "",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption =
    sortOptions.find((option) => option.value === value) || sortOptions[0];

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white
          ${
            isOpen
              ? "border-primary-green ring-2 ring-primary-green ring-opacity-20"
              : "border-gray-300 hover:border-gray-400"
          }
          transition-all duration-200
        `}
      >
        <span className="text-sm text-gray-700">{selectedOption.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm text-left
                  ${
                    option.value === value
                      ? "bg-primary-green text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                  transition-colors duration-150
                `}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
