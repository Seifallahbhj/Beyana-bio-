"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Product } from "../services/api";

// Contexte du panier pour l'application e-commerce
// Fournit les fonctions et états liés au panier et à l'adresse de livraison

// Interface pour l'adresse de livraison
export type ShippingAddress = {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
};

// Interface pour un article dans le panier (hérite de Product)
export interface CartItem extends Product {
  quantity: number;
}

// Interface du contexte du panier
interface CartContextType {
  cartItems: CartItem[]; // Liste des articles dans le panier
  shippingAddress: ShippingAddress | null; // Adresse de livraison
  addToCart: (product: Product, quantity: number) => void; // Ajouter un produit au panier
  removeFromCart: (productId: string) => void; // Retirer un produit du panier
  updateQuantity: (productId: string, quantity: number) => void; // Modifier la quantité d'un produit
  clearCart: () => void; // Vider le panier
  saveShippingAddress: (address: ShippingAddress) => void; // Sauvegarder l'adresse de livraison
  cartCount: number; // Nombre total d'articles
  cartTotal: number; // Prix total du panier
}

// Création du contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte du panier
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Props du fournisseur de contexte
interface CartProviderProps {
  children: ReactNode;
}

// Fournisseur du contexte panier
export function CartProvider({ children }: CartProviderProps) {
  // État du panier et de l'adresse de livraison
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);

  // Effet : Charger le panier et l'adresse depuis localStorage au démarrage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("beyana_cart");
      if (storedCart) {
        let parsed;
        try {
          parsed = JSON.parse(storedCart);
        } catch {
          localStorage.removeItem("beyana_cart");
          parsed = [];
        }
        if (!Array.isArray(parsed)) {
          localStorage.removeItem("beyana_cart");
          parsed = [];
        }
        setCartItems(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return prev;
        });
      }
      const storedAddress = localStorage.getItem("beyana_shipping_address");
      if (storedAddress) {
        setShippingAddress(JSON.parse(storedAddress));
      }
    } catch {
      localStorage.removeItem("beyana_cart");
      localStorage.removeItem("beyana_shipping_address");
    }
  }, []);

  // Effet : Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    const current = localStorage.getItem("beyana_cart");
    const serialized = JSON.stringify(cartItems);
    if (current !== serialized) {
      try {
        localStorage.setItem("beyana_cart", serialized);
      } catch {
        // Erreur ignorée volontairement
      }
    }
  }, [cartItems]);

  // Ajouter un produit au panier (ou augmenter la quantité si déjà présent)
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  }, []);

  // Retirer un produit du panier
  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  }, []);

  // Modifier la quantité d'un produit (supprime si quantité <= 0)
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item._id === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  // Vider le panier et l'adresse de livraison
  const clearCart = useCallback(() => {
    setCartItems([]);
    setShippingAddress(null);
    try {
      localStorage.removeItem("beyana_cart");
      localStorage.removeItem("beyana_shipping_address");
    } catch {
      // Erreur ignorée volontairement
    }
  }, []);

  // Sauvegarder l'adresse de livraison
  const saveShippingAddress = useCallback((address: ShippingAddress) => {
    try {
      localStorage.setItem("beyana_shipping_address", JSON.stringify(address));
      setShippingAddress(address);
    } catch {
      // Erreur ignorée volontairement
    }
  }, []);

  // Calcul du nombre total d'articles dans le panier
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  // Calcul du prix total du panier
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Valeur du contexte, optimisée avec useMemo
  const value = useMemo(
    () => ({
      cartItems,
      shippingAddress,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      saveShippingAddress,
      cartCount,
      cartTotal,
    }),
    [
      cartItems,
      shippingAddress,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      saveShippingAddress,
      cartCount,
      cartTotal,
    ]
  );

  // Fournit le contexte à tous les enfants
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
