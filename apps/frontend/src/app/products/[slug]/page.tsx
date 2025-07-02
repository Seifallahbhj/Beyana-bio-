"use client";

import React from "react";
// import Image from "next/image";
import RobustImage from "../../../components/ui/RobustImage";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import FeaturedProductsSection from "../../../components/features/FeaturedProductsSection";
import { Button, Card } from "../../../components/ui";
import { useProduct } from "../../../hooks/useProducts";
import { useParams } from "next/navigation";

// Types pour les catégories (données statiques pour l'instant)
interface Category {
  name: string;
  image: string;
  productCount: number;
  href: string;
}

const categories: Category[] = [
  {
    name: "Fruits & Légumes",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
    productCount: 45,
    href: "/category/fruits-legumes",
  },
  {
    name: "Céréales & Grains",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    productCount: 32,
    href: "/category/cereales",
  },
  {
    name: "Huiles & Vinaigres",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop",
    productCount: 28,
    href: "/category/huiles",
  },
  {
    name: "Épices & Condiments",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    productCount: 67,
    href: "/category/epices",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { product, loading, error } = useProduct(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-600">Chargement du produit...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-lg text-red-600">
          {error || "Produit introuvable."}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Galerie d'images */}
            <div>
              {product.images && product.images.length > 0 ? (
                <div>
                  <div className="relative w-full h-96 mb-4">
                    <RobustImage
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain rounded-xl border bg-white"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      fallbackType="svg"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {product.images.map((img: string, idx: number) => (
                        <div
                          key={img}
                          className="relative w-20 h-20 border rounded overflow-hidden"
                        >
                          <RobustImage
                            src={img}
                            alt={`${product.name} miniature ${idx + 1}`}
                            fill
                            className="object-cover"
                            fallbackType="svg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-xl border">
                  <span className="text-gray-400">Aucune image</span>
                </div>
              )}
            </div>

            {/* Infos produit */}
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                {product.isNew && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Nouveau
                  </span>
                )}
                {product.isOnSale && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                    Promo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-primary-green">
                  {product.price.toFixed(2)} €
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-lg line-through text-gray-400">
                      {product.originalPrice.toFixed(2)} €
                    </span>
                  )}
              </div>
              <div className="mb-4 text-gray-700">{product.description}</div>
              <div className="mb-4 flex flex-wrap gap-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded">
                  Catégorie : {product.category?.name}
                </span>
                {product.origin && (
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    Origine : {product.origin}
                  </span>
                )}
                {product.weight && (
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    Poids : {product.weight}
                  </span>
                )}
                {product.unit && (
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    Unité : {product.unit}
                  </span>
                )}
                {product.stock !== undefined && (
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    Stock :{" "}
                    {product.stock > 0 ? `${product.stock} dispo` : "Rupture"}
                  </span>
                )}
              </div>
              {product.certifications && product.certifications.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.certifications.map((cert: string) => (
                    <span
                      key={cert}
                      className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="font-semibold">
                  {product.rating?.toFixed(1) ||
                    product.averageRating?.toFixed(1) ||
                    "-"}
                </span>
                <span className="text-gray-500">
                  ({product.reviewCount || product.numReviews || 0} avis)
                </span>
              </div>
              <Button
                size="lg"
                variant="secondary"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Explorez nos catégories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez notre gamme complète de produits bio organisés par
                catégories pour faciliter votre shopping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(category => (
                <Card key={category.name} hover className="overflow-hidden">
                  <div className="relative h-48">
                    <RobustImage
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      fallbackType="svg"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-semibold mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {category.productCount} produits
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <FeaturedProductsSection />

        {/* Values Section */}
        <section className="py-16 bg-neutral-cream">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Nos valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Chez BEYANA, nous nous engageons pour votre santé et celle de la
                planète.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Agriculture Biologique
                </h3>
                <p className="text-gray-600">
                  Tous nos produits sont issus de l&apos;agriculture biologique,
                  garantissant une qualité supérieure sans pesticides.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Production Locale
                </h3>
                <p className="text-gray-600">
                  Nous privilégions les producteurs locaux pour réduire
                  l&apos;empreinte carbone et soutenir l&apos;économie locale.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Emballages Éco-responsables
                </h3>
                <p className="text-gray-600">
                  Nos emballages sont conçus pour minimiser l&apos;impact
                  environnemental et favoriser le recyclage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary-green text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Restez informé
            </h2>
            <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
              Recevez nos dernières nouveautés, offres exclusives et conseils
              pour une alimentation saine et responsable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-gold"
              />
              <Button variant="secondary" size="lg">
                S&apos;abonner
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
