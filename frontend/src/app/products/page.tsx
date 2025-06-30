"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {
  ProductGrid,
  FilterPanel,
  SearchBar,
  SortDropdown,
} from "../../components/features";
import { Button, Pagination } from "../../components/ui";
import { useProducts } from "../../hooks/useProducts";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // État local pour les filtres
  const [filters, setFilters] = useState({
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "-createdAt",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  });

  // Utiliser le hook pour récupérer les produits
  const { products, loading, error, pagination, facets } = useProducts(filters);

  // Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page > 1) params.set("page", filters.page.toString());
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort !== "-createdAt") params.set("sort", filters.sort);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());

    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.push(newUrl, { scroll: false });
  }, [filters, router]);

  // Gestionnaires pour les filtres
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId, page: 1 }));
  };

  const handleSortChange = (sortOption: string) => {
    setFilters((prev) => ({ ...prev, sort: sortOption, page: 1 }));
  };

  const handlePriceChange = (minPrice?: number, maxPrice?: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice,
      maxPrice,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: "",
      search: "",
      sort: "-createdAt",
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Nos Produits Bio
          </h1>
          <p className="text-gray-600">
            Découvrez notre sélection premium de produits biologiques
          </p>
        </div>

        {/* Barre de recherche et tri */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onSearch={handleSearch}
              placeholder="Rechercher un produit..."
            />
          </div>
          <div className="lg:w-48">
            <SortDropdown value={filters.sort} onChange={handleSortChange} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panneau de filtres */}
          <aside className="lg:w-64">
            <FilterPanel
              categories={facets?.categories || []}
              brands={facets?.brands || []}
              priceRange={facets?.priceRange}
              selectedCategory={filters.category}
              selectedPriceRange={[filters.minPrice, filters.maxPrice]}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Résultats et actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {loading
                  ? "Chargement..."
                  : `${pagination?.total || 0} produit${
                      pagination?.total !== 1 ? "s" : ""
                    } trouvé${pagination?.total !== 1 ? "s" : ""}`}
              </div>

              {(filters.category ||
                filters.search ||
                filters.minPrice ||
                filters.maxPrice) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>

            {/* Grille de produits */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-t-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Aucun produit trouvé avec ces critères.
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Composant de chargement
function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-t-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}
