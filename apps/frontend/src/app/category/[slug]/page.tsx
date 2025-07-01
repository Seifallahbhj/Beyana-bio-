"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import ProductGrid from "../../../components/features/ProductGrid";
import SearchBar from "../../../components/features/SearchBar";
import SortDropdown from "../../../components/features/SortDropdown";
import { Button } from "../../../components/ui";
import { apiService, Product, Category } from "../../../services/api";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "-createdAt",
    search: "",
  });

  // Charger les informations de la catégorie
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await apiService.getCategory(slug);
        if (response.success && response.data) {
          setCategory(response.data);
        } else {
          setError("Catégorie non trouvée");
        }
      } catch {
        setError("Erreur lors du chargement de la catégorie");
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  // Charger les produits de la catégorie
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.getProducts({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          search: filters.search,
          category: slug,
        });

        if (response.success && response.data) {
          setProducts(response.data.products);
          setPagination({
            currentPage: response.data.page,
            totalPages: response.data.pages,
            total: response.data.total,
            limit: filters.limit,
          });
        } else {
          setError("Erreur lors du chargement des produits");
        }
      } catch {
        setError("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProducts();
    }
  }, [slug, filters]);

  const handleSearch = (searchTerm: string) => {
    setSearchValue(searchTerm);
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleSortChange = (sortOption: string) => {
    setFilters(prev => ({ ...prev, sort: sortOption, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleBackToProducts = () => {
    router.push("/products");
  };

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Button onClick={handleBackToProducts}>
                Retour aux produits
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-green to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                {category?.name || "Catégorie"}
              </h1>
              {category?.description && (
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Barre d'outils */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8">
              <div className="flex-1 max-w-md">
                <SearchBar value={searchValue} onSearch={handleSearch} />
              </div>
              <div className="flex items-center gap-4">
                <SortDropdown
                  value={filters.sort}
                  onChange={handleSortChange}
                />
              </div>
            </div>

            {/* Résultats */}
            <div className="mb-8">
              <div className="text-sm text-gray-600">
                {loading
                  ? "Chargement..."
                  : `${pagination?.total || 0} produit${
                      pagination?.total !== 1 ? "s" : ""
                    } trouvé${pagination?.total !== 1 ? "s" : ""}`}
              </div>
            </div>

            {/* Grille de produits */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-8">
                  Aucun produit n&apos;est disponible dans cette catégorie pour
                  le moment.
                </p>
                <Button onClick={handleBackToProducts}>
                  Voir tous les produits
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Précédent
                  </Button>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === pagination.currentPage;

                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Suivant
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
