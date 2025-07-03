"use client";

import React from "react";
// import Image from "next/image";
import RobustImage from "../../../components/ui/RobustImage";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
// import FeaturedProductsSection from "../../../components/features/FeaturedProductsSection";
import { Button } from "../../../components/ui";
import { useProduct, useProducts } from "../../../hooks/useProducts";
import { useParams } from "next/navigation";

// Types pour les catégories (données statiques pour l'instant)
// interface Category {
//   name: string;
//   image: string;
//   productCount: number;
//   href: string;
// }

// const categories: Category[] = [ ... ];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { product, loading, error } = useProduct(slug);

  // Produits similaires (même catégorie, exclure le produit courant)
  const { products: similarProducts, loading: loadingSimilar } = useProducts(
    product && product.category?._id
      ? { category: product.category._id, limit: 4 }
      : { limit: 4 }
  );

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
              {/* Bloc Badges dynamique */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.isNew && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    Nouveau
                  </span>
                )}
                {product.isOnSale && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                    Promo
                  </span>
                )}
                {product.attributes &&
                  product.attributes.length > 0 &&
                  product.attributes.map((attr, idx) => {
                    let color = "bg-blue-100 text-blue-700";
                    if (attr.toLowerCase().includes("bio"))
                      color = "bg-green-100 text-green-700";
                    if (attr.toLowerCase().includes("vegan"))
                      color = "bg-emerald-100 text-emerald-700";
                    if (attr.toLowerCase().includes("sans-gluten"))
                      color = "bg-yellow-100 text-yellow-700";
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-semibold ${color}`}
                      >
                        {attr}
                      </span>
                    );
                  })}
                {product.certifications &&
                  product.certifications.length > 0 &&
                  product.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold"
                    >
                      {cert}
                    </span>
                  ))}
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

          {/* Description détaillée */}
          {product.descriptionDetailed && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Description détaillée
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {product.descriptionDetailed}
              </p>
            </div>
          )}

          {/* Tableau nutritionnel */}
          {product.nutritionalValues &&
            product.nutritionalValues.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Valeurs nutritionnelles
                </h2>
                <table className="min-w-max w-full table-auto border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Nutriment</th>
                      <th className="px-4 py-2 text-left">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.nutritionalValues.map((nv, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{nv.name}</td>
                        <td className="px-4 py-2">
                          {nv.value} {nv.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Ingrédients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Ingrédients
              </h2>
              <ul className="list-disc list-inside text-gray-700">
                {product.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Attributs (bio, vegan, etc.) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Attributs
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.attributes.map((attr, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Avis clients (structure + placeholder) */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Avis clients
            </h2>
            {/* Liste d'avis mockés (à remplacer par les vrais avis plus tard) */}
            <div className="space-y-4 mb-6">
              {/* Exemple d'avis */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Sophie</span>
                  <span className="text-yellow-500">★★★★☆</span>
                  <span className="text-xs text-gray-400">il y a 2 jours</span>
                </div>
                <div className="text-gray-700">
                  Produit de grande qualité, goût authentique, je recommande !
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Marc</span>
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-xs text-gray-400">
                    il y a 1 semaine
                  </span>
                </div>
                <div className="text-gray-700">
                  Livraison rapide, produit conforme à la description.
                </div>
              </div>
              {/* Si aucun avis, afficher un message */}
              {/* <div className="text-gray-500">Aucun avis pour ce produit.</div> */}
            </div>
            {/* Formulaire d'ajout d'avis (placeholder) */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="font-semibold mb-2">Laisser un avis</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="text-gray-500 text-sm">
                  (Sélectionnez une note)
                </span>
              </div>
              <textarea
                className="w-full border rounded p-2 mb-2 text-sm"
                rows={3}
                placeholder="Votre commentaire..."
                disabled
              />
              <button
                className="bg-primary-green text-white px-4 py-2 rounded disabled:opacity-60"
                disabled
              >
                Envoyer (bientôt disponible)
              </button>
            </div>
          </div>

          {/* Produits similaires */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Produits similaires
            </h2>
            {loadingSimilar ? (
              <div className="text-gray-500">Chargement...</div>
            ) : similarProducts && similarProducts.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts
                  .filter(p => p.slug !== product.slug)
                  .slice(0, 4)
                  .map(p => (
                    <div
                      key={p._id}
                      className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center"
                    >
                      <div className="w-24 h-24 mb-2 relative">
                        <RobustImage
                          src={p.images[0] || ""}
                          alt={p.name}
                          fill
                          className="object-cover rounded"
                          fallbackType="svg"
                        />
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {p.category?.name}
                      </div>
                      <a
                        href={`/products/${p.slug}`}
                        className="font-semibold text-gray-900 hover:text-primary-green text-center mb-1 line-clamp-2"
                      >
                        {p.name}
                      </a>
                      <div className="text-primary-green font-bold">
                        {p.price.toFixed(2)} €
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500">
                Aucun produit similaire trouvé.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
