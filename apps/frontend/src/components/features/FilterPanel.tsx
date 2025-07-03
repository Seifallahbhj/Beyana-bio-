"use client";

import React, { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "../ui";

// Composant FilterPanel : panneau de filtres pour le catalogue produits

// Props du composant FilterPanel
interface CategoryFacet {
  _id: string;
  name: string;
}
interface FilterPanelProps {
  categories: CategoryFacet[]; // Liste des catégories
  brands: string[]; // Liste des marques
  priceRange?: {
    minPrice: number;
    maxPrice: number;
  }; // Plage de prix possible
  selectedCategory: string; // Catégorie sélectionnée
  selectedPriceRange: [number | undefined, number | undefined]; // Plage de prix sélectionnée
  onCategoryChange: (categoryId: string) => void; // Callback changement catégorie
  onPriceChange: (minPrice?: number, maxPrice?: number) => void; // Callback changement prix
  onClearFilters: () => void; // Callback reset filtres
}

export default function FilterPanel({
  categories,
  brands,
  priceRange,
  selectedCategory,
  selectedPriceRange,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [priceInputs, setPriceInputs] = useState({
    min: selectedPriceRange[0]?.toString() || "",
    max: selectedPriceRange[1]?.toString() || "",
  });

  const hasActiveFilters =
    selectedCategory || selectedPriceRange[0] || selectedPriceRange[1];

  const handlePriceInputChange = (field: "min" | "max", value: string) => {
    setPriceInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceApply = () => {
    const minPrice = priceInputs.min ? parseFloat(priceInputs.min) : undefined;
    const maxPrice = priceInputs.max ? parseFloat(priceInputs.max) : undefined;
    onPriceChange(minPrice, maxPrice);
  };

  const handlePriceReset = () => {
    setPriceInputs({ min: "", max: "" });
    onPriceChange(undefined, undefined);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtres</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Bouton effacer tous les filtres */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer tous les filtres
            </Button>
          )}

          {/* Filtre par catégorie */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange("")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-primary-green text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map(category => (
                <button
                  key={category._id}
                  onClick={() => onCategoryChange(category._id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category._id
                      ? "bg-primary-green text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par prix */}
          {priceRange && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Prix</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Min
                    </label>
                    <input
                      type="number"
                      value={priceInputs.min}
                      onChange={e =>
                        handlePriceInputChange("min", e.target.value)
                      }
                      placeholder={priceRange.minPrice.toString()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-green"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Max
                    </label>
                    <input
                      type="number"
                      value={priceInputs.max}
                      onChange={e =>
                        handlePriceInputChange("max", e.target.value)
                      }
                      placeholder={priceRange.maxPrice.toString()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-green"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePriceApply}
                    className="flex-1"
                  >
                    Appliquer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePriceReset}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filtre par marque */}
          {brands.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Marques</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {brands.map(brand => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
