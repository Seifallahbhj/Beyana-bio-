"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Button, Badge } from "../ui";
import { Product as ApiProduct } from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import toast from "react-hot-toast";
import RobustImage from "../ui/RobustImage";
import { ProductSVG } from "../ui/ProductSVG";

// Composant ProductCard : carte d'affichage d'un produit avec actions panier/favoris

// Props du composant ProductCard
export interface ProductCardProps {
  product: ApiProduct; // Produit à afficher
  className?: string; // Classes CSS additionnelles
}

const ProductCard: React.FC<ProductCardProps> = ({
  product: apiProduct,
  className,
}) => {
  const { user, refreshProfile } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const { addToCart, updateQuantity, cartItems } = useCart();

  // On utilise directement apiProduct, qui a le champ `_id`
  const product = apiProduct;

  const itemInCart = cartItems.find(item => item._id === product._id);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsWishlisted(user.wishlist.includes(product._id));
    }
  }, [user, product._id]);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleAddToWishlist = async () => {
    if (!user || isLoadingWishlist) return;
    setIsLoadingWishlist(true);
    try {
      if (!isWishlisted) {
        const response = await apiService.addToWishlist(product._id);
        if (response.success) {
          setIsWishlisted(true);
          setAnimateHeart(true);
          await refreshProfile();
          toast.success("Ajouté aux favoris !");
        }
      } else {
        const response = await apiService.removeFromWishlist(product._id);
        if (response.success) {
          setIsWishlisted(false);
          setAnimateHeart(true);
          await refreshProfile();
          toast("Retiré des favoris", { icon: "💔" });
        }
      }
    } catch {
      toast.error("Erreur lors de la mise à jour des favoris");
    } finally {
      setIsLoadingWishlist(false);
      setTimeout(() => setAnimateHeart(false), 400);
    }
  };

  const handleIncrease = () => {
    if (itemInCart) {
      updateQuantity(product._id, itemInCart.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (itemInCart) {
      updateQuantity(product._id, itemInCart.quantity - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { status: "out", text: "Rupture", color: "error" as const };
    if (stock < 5)
      return { status: "low", text: "Stock limité", color: "warning" as const };
    return { status: "available", text: "En stock", color: "success" as const };
  };

  const stockStatus = getStockStatus(product.stock ?? 0);

  return (
    <Card
      className={`group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
      hover
    >
      <div>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <RobustImage
            src={product.images[0] || ""}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackSvg={<ProductSVG />}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="primary" size="sm">
                Nouveau
              </Badge>
            )}
            {product.isOnSale && product.originalPrice && (
              <Badge variant="secondary" size="sm">
                -
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                %
              </Badge>
            )}
          </div>

          <button
            onClick={handleAddToWishlist}
            disabled={isLoadingWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200
              ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              }
              ${animateHeart ? "animate-heart-bounce" : ""}
              ${isLoadingWishlist ? "opacity-60 cursor-not-allowed" : ""}
            `}
            aria-label={
              isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"
            }
          >
            {isLoadingWishlist ? (
              <svg
                className="h-5 w-5 animate-spin text-gray-400"
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
              <svg
                className="h-5 w-5"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            {product.category.name}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-green transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating ?? 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {product.rating} ({product.reviewCount} avis)
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-primary-green">
            {formatPrice(product.price)}
          </div>
          {product.isOnSale && product.originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>

        {stockStatus.status === "out" ? (
          <Button variant="danger" fullWidth disabled>
            Rupture de stock
          </Button>
        ) : !itemInCart ? (
          <Button variant="primary" fullWidth onClick={handleAddToCart}>
            Ajouter au panier
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDecrease}>
              -
            </Button>
            <span className="font-bold text-lg w-10 text-center">
              {itemInCart.quantity}
            </span>
            <Button size="sm" variant="outline" onClick={handleIncrease}>
              +
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
