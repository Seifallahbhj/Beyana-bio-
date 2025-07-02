// Types pour les valeurs nutritionnelles
export interface NutritionalValue {
  name: string; // ex: Calories, Protéines, Lipides
  value: string; // ex: 100kcal, 10g, 5g
  unit?: string; // ex: kcal, g, mg
}

// Types pour les dimensions
export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string; // ex: cm, mm
}

// Interface principale pour les produits
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  descriptionShort: string;
  descriptionDetailed: string;
  price: number;
  promotionalPrice?: number;
  originalPrice?: number; // Alias pour promotionalPrice (compatibilité frontend)
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  subCategory?: {
    _id: string;
    name: string;
  };
  brand?: string;
  sku?: string;
  stockQuantity: number;
  stock?: number; // Alias pour stockQuantity (compatibilité frontend)
  certifications: string[];
  ingredients?: string[];
  nutritionalValues?: NutritionalValue[];
  origin?: string;
  weight?: number; // en grammes par exemple
  weightUnit?: string; // ex: g, kg
  unit?: string; // Alias pour weightUnit (compatibilité frontend)
  dimensions?: Dimensions;
  isFeatured: boolean;
  tags?: string[];
  averageRating: number;
  rating?: number; // Alias pour averageRating (compatibilité frontend)
  numReviews: number;
  reviewCount?: number; // Alias pour numReviews (compatibilité frontend)
  isActive: boolean;
  attributes: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les filtres de produits
export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  isFeatured?: boolean;
  isOnSale?: boolean;
}

// Interface pour les options de requête de produits
export interface ProductQueryOptions {
  sort?: { [key: string]: 1 | -1 };
  skip?: number;
  limit?: number;
}

// Interface pour la réponse de l'API produits
export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
  facets: {
    brands: string[];
    categories: string[];
    priceRange: {
      minPrice: number;
      maxPrice: number;
    };
  };
}
