// Interface générique pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

// Interface pour les filtres de base
export interface BaseFilters {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
