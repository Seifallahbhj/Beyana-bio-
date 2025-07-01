"use client";

import React from "react";
import ProductGrid from "./ProductGrid";
import { Button } from "../ui";
import { useFeaturedProducts } from "../../hooks/useProducts";

export default function FeaturedProductsSection() {
  const { products, loading, error } = useFeaturedProducts();

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Produits vedettes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nos produits les plus populaires, sélectionnés pour leur qualité
              exceptionnelle et leur goût unique.
            </p>
          </div>

          {/* Skeleton loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Produits vedettes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nos produits les plus populaires, sélectionnés pour leur qualité
              exceptionnelle et leur goût unique.
            </p>
          </div>

          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Produits vedettes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nos produits les plus populaires, sélectionnés pour leur qualité
              exceptionnelle et leur goût unique.
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Aucun produit vedette disponible pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Produits vedettes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nos produits les plus populaires, sélectionnés pour leur qualité
            exceptionnelle et leur goût unique.
          </p>
        </div>

        <ProductGrid products={products} />

        <div className="text-center mt-12">
          <Button size="lg" variant="primary">
            Voir tous nos produits
          </Button>
        </div>
      </div>
    </section>
  );
}
