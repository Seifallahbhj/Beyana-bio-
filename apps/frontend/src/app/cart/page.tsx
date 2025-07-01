"use client";

import React from "react";
import { useCart } from "../../contexts/CartContext";
import Link from "next/link";
import Button from "../../components/ui/Button";
import RobustImage from "../../components/ui/RobustImage";
import { ProductSVG } from "../../components/ui/ProductSVG";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } =
    useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Votre Panier</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 mb-4">Votre panier est vide.</p>
          <Link href="/products">
            <Button variant="primary">Continuer vos achats</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li
                    key={item._id}
                    className="p-4 flex items-center space-x-4"
                  >
                    <div className="w-24 h-24 relative rounded-md overflow-hidden">
                      <RobustImage
                        src={item.images[0] || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        fallbackSvg={<ProductSVG />}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.category.name}
                      </p>
                      <p className="text-lg font-bold text-primary-green">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="w-10 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    <div>
                      <p className="font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                      >
                        &times;
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total ({cartCount} articles)</span>
                  <span className="font-semibold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="font-semibold">
                    Calculée à la prochaine étape
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link href="/checkout/shipping" className="mt-6 block">
                <Button fullWidth variant="primary">
                  Passer la commande
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
