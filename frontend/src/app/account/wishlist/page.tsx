"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { Product } from "@/services/api";
import { Heart, ShoppingCart, Trash2, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import RobustImage from "@/components/ui/RobustImage";
import { ProductSVG } from "@/components/ui/ProductSVG";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<{ [id: string]: boolean }>({});
  const [animateTrash, setAnimateTrash] = useState<{ [id: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await apiService.getWishlist();
        if (response.success && response.data) {
          setWishlist(response.data);
        } else {
          setWishlist([]);
        }
      } catch {
        setError("Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const removeFromWishlist = async (productId: string) => {
    setRemoving((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await apiService.removeFromWishlist(productId);
      if (response.success) {
        setWishlist((prev) =>
          prev.filter((product) => product._id !== productId)
        );
        setAnimateTrash((prev) => ({ ...prev, [productId]: true }));
        toast("Retiré des favoris", { icon: "💔" });
        setTimeout(() => {
          setAnimateTrash((prev) => ({ ...prev, [productId]: false }));
        }, 400);
      }
    } catch {
      toast.error("Erreur lors de la suppression du favori");
    } finally {
      setRemoving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await apiService.addToCart(productId, 1);
      if (response.success) {
        // Optionnel: Afficher une notification de succès
      }
    } catch {
      // Supprimer tous les console.error, etc. du code
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="mr-2 h-6 w-6 text-primary-green" />
            Mes Favoris
          </h2>
          <p className="text-gray-600 mt-1">Vos produits préférés</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Heart className="mr-2 h-6 w-6 text-primary-green" />
          Mes Favoris
        </h2>
        <p className="text-gray-600 mt-1">Vos produits préférés</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {wishlist.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucun favori
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n&apos;avez pas encore ajouté de produits à vos favoris.
          </p>
          <div className="mt-6">
            <Link href="/products">
              <Button>Découvrir nos produits</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative">
                <RobustImage
                  src={product.images[0]}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover"
                  fallbackSvg={<ProductSVG />}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWishlist(product._id)}
                    className={`bg-white hover:bg-red-50 hover:text-red-600
                      ${animateTrash[product._id] ? "animate-trash-bounce" : ""}
                      ${
                        removing[product._id]
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }
                    `}
                    disabled={removing[product._id]}
                  >
                    {removing[product._id] ? (
                      <svg
                        className="h-4 w-4 animate-spin text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-primary-green">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{product.rating}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{product.reviewCount} avis</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {product.stock > 0 ? (
                      <span className="text-green-600">En stock</span>
                    ) : (
                      <span className="text-red-600">Rupture</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ajouter au panier
                  </Button>

                  <Link href={`/products/${product._id}`}>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir le produit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
