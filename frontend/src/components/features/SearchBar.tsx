"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

// Composant SearchBar : barre de recherche avec gestion du texte et du reset

// Props du composant SearchBar
interface SearchBarProps {
  value: string; // Valeur du champ de recherche
  onSearch: (searchTerm: string) => void; // Callback lors de la recherche
  placeholder?: string; // Placeholder du champ
  className?: string; // Classes CSS additionnelles
}

export default function SearchBar({
  value,
  onSearch,
  placeholder = "Rechercher...",
  className = "",
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mettre à jour la valeur interne quand la prop change
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce pour éviter trop d'appels API
  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSearch(searchTerm);
      }, 300);
    },
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            isFocused ? "text-primary-green" : "text-gray-400"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent
            ${
              isFocused
                ? "border-primary-green bg-white"
                : "border-gray-300 bg-white hover:border-gray-400"
            }
            transition-colors duration-200
          `}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
