"use client";
import React, { useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useProducts } from "../../hooks/useProducts";
import FilterPanel from "../../components/features/FilterPanel";
import ProductGrid from "../../components/features/ProductGrid";
import SortDropdown from "../../components/features/SortDropdown";
import Pagination from "../../components/ui/Pagination";
import SearchBar from "../../components/features/SearchBar";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: "",
    search: "",
    sort: "-createdAt",
  });
  const { products, loading, error, pagination, facets } = useProducts(filters);

  const handleSearch = (search: string) =>
    setFilters(f => ({ ...f, search, page: 1 }));
  const handleCategory = (category: string) =>
    setFilters(f => ({ ...f, category, page: 1 }));
  const handleSort = (sort: string) => setFilters(f => ({ ...f, sort }));
  const handlePage = (page: number) => setFilters(f => ({ ...f, page }));

  // Pour FilterPanel
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number | undefined, number | undefined]
  >([undefined, undefined]);
  const handlePriceChange = (minPrice?: number, maxPrice?: number) => {
    setSelectedPriceRange([minPrice, maxPrice]);
    setFilters(f => ({ ...f, minPrice, maxPrice, page: 1 }));
  };
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: "",
      search: "",
      sort: "-createdAt",
    });
    setSelectedPriceRange([undefined, undefined]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtres latéraux */}
          <aside className="md:w-1/4">
            <FilterPanel
              categories={facets?.categories || []}
              brands={facets?.brands || []}
              selectedCategory={filters.category}
              onCategoryChange={handleCategory}
              priceRange={facets?.priceRange}
              selectedPriceRange={selectedPriceRange}
              onPriceChange={handlePriceChange}
              onClearFilters={handleClearFilters}
            />
          </aside>
          {/* Contenu principal */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <SearchBar value={filters.search} onSearch={handleSearch} />
              <SortDropdown value={filters.sort} onChange={handleSort} />
            </div>
            {loading ? (
              <div className="text-center py-20 text-gray-500">
                Chargement des produits...
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-600">{error}</div>
            ) : (
              <>
                <ProductGrid products={products} />
                {pagination && pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={handlePage}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
