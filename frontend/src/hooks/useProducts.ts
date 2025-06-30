"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService, Product } from "../services/api";

// Interface des filtres pour la recherche de produits
interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Interface des infos de pagination
interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

// Interface des facettes (filtres avancés)
interface Facets {
  brands: string[];
  categories: string[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
}

// Hook principal pour récupérer une liste de produits avec filtres, pagination, facettes
interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  facets: Facets | null;
  refetch: () => void;
}

export function useProducts(filters: ProductFilters): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProducts({
        page: filters.page,
        limit: filters.limit,
        category: filters.category,
        search: filters.search,
        sort: filters.sort,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      if (response.success && response.data) {
        // La réponse contient les produits et les métadonnées
        const {
          products: productsData,
          page,
          pages,
          total,
          facets: facetsData,
        } = response.data;

        setProducts(productsData);
        setPagination({ page, pages, total });
        setFacets(facetsData);
      } else {
        setError(response.error || "Erreur lors du chargement des produits");
        setProducts([]);
        setPagination(null);
        setFacets(null);
      }
    } catch {
      setError("Erreur de connexion au serveur");
      setProducts([]);
      setPagination(null);
      setFacets(null);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.category,
    filters.search,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    facets,
    refetch,
  };
}

// Hook pour les produits vedettes
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getFeaturedProducts();

        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(
            response.error || "Erreur lors du chargement des produits vedettes"
          );
        }
      } catch {
        setError("Erreur de connexion au serveur");
        setProducts([]);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return { products, loading, error };
}

// Hook pour les nouveaux produits
export function useNewProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getNewProducts();

        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(
            response.error || "Erreur lors du chargement des nouveaux produits"
          );
        }
      } catch {
        setError("Erreur de connexion au serveur");
        setProducts([]);
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  return { products, loading, error };
}

// Hook pour les produits en promotion
export function useSaleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getSaleProducts();

        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(
            response.error ||
              "Erreur lors du chargement des produits en promotion"
          );
        }
      } catch {
        setError("Erreur de connexion au serveur");
        setProducts([]);
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  return { products, loading, error };
}

// Hook pour un produit individuel
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getProduct(productId);

        if (response.success && response.data) {
          setProduct(response.data);
          setLoading(false);
        } else {
          setError(response.error || "Produit non trouvé");
          setLoading(false);
        }
      } catch {
        setError("Erreur de connexion au serveur");
        setProduct(null);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}
