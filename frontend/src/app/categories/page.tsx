"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui";
import { apiService, Category } from "../../services/api";
import Link from "next/link";
import RobustImage from "../../components/ui/RobustImage";
import { CategorySVG } from "../../components/ui/CategorySVG";

interface CategoryWithProducts extends Category {
  productCount: number;
  image?: string;
}

// Fonction utilitaire pour générer un slug propre (sans accents, espaces, caractères spéciaux)
function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // retire les accents
    .replace(/&/g, "et")
    .replace(/[^\w\s-]/g, "") // retire les caractères spéciaux
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        if (response.success && response.data) {
          // Correction : utiliser response.data.categories si la réponse est de la forme { data: { categories: [...] } }
          let apiCategories: CategoryWithProducts[] = [];
          if (Array.isArray(response.data)) {
            apiCategories = response.data as CategoryWithProducts[];
          } else if (
            response.data &&
            Array.isArray(
              (
                response.data as unknown as {
                  categories?: CategoryWithProducts[];
                }
              ).categories
            )
          ) {
            apiCategories = (
              response.data as unknown as { categories: CategoryWithProducts[] }
            ).categories;
          }
          const categoriesWithCounts = apiCategories.map(
            (category: CategoryWithProducts, index: number) => ({
              ...category,
              productCount: Math.floor(Math.random() * 50) + 10, // Simulation
              image: `https://images.unsplash.com/photo-${
                [
                  "1542838132-92c53300491e",
                  "1586201375761-83865001e31c",
                  "1474979266404-7eaacbcd87c5",
                  "1556909114-f6e7ad7d3136",
                  "1574323347407-f5e1ad6d020b",
                  "1565299624946-8c6c7925683b",
                ][index % 6]
              }?w=400&h=300&fit=crop`,
            })
          );
          setCategories(categoriesWithCounts);
        } else {
          setError("Erreur lors du chargement des catégories");
        }
      } catch {
        setError("Erreur lors du chargement des catégories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
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
              <h1 className="text-4xl font-bold mb-4">Nos Catégories</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Découvrez notre gamme complète de produits biologiques organisés
                par catégories pour faciliter votre shopping.
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm animate-pulse"
                  >
                    <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6 space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Statistiques */}
                <div className="text-center mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-primary-green mb-2">
                        {categories.length}
                      </div>
                      <div className="text-gray-600">Catégories</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-primary-green mb-2">
                        {categories.reduce(
                          (sum, cat) => sum + cat.productCount,
                          0
                        )}
                      </div>
                      <div className="text-gray-600">Produits</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-3xl font-bold text-primary-green mb-2">
                        100%
                      </div>
                      <div className="text-gray-600">Bio</div>
                    </div>
                  </div>
                </div>

                {/* Grille des catégories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${slugify(category.name)}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="relative aspect-video">
                          <RobustImage
                            src={
                              category.image ||
                              "/images/placeholder-category.svg"
                            }
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fallbackSvg={<CategorySVG />}
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {category.name}
                            </h3>
                            <p className="text-white/90 text-sm">
                              {category.productCount} produits
                            </p>
                          </div>
                        </div>
                        <div className="p-6">
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-primary-green font-medium text-sm">
                              Explorer →
                            </span>
                            <div className="w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-primary-green"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vous ne trouvez pas ce que vous cherchez ?
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Parcourez notre catalogue complet ou contactez-nous pour des
                    produits spécifiques.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="primary" size="lg">
                      Voir tous les produits
                    </Button>
                    <Button variant="outline" size="lg">
                      Nous contacter
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
