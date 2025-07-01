// Interface pour les catégories
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  slug?: string;
  parent?: string; // Pour les sous-catégories
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
