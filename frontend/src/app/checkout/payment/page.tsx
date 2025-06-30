"use client";

import React, { useState, useEffect, useRef } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import CheckoutForm from "../../../components/features/CheckoutForm";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService, OrderPayload } from "../../../services/api";

// Charger la clé publique Stripe (assurez-vous que cette variable d'environnement est définie)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { cartItems, shippingAddress, cartTotal } = useCart();
  const { user } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const initializePayment = async () => {
      setError(null);

      // 1. Vérifier que toutes les informations nécessaires sont présentes
      if (
        !user ||
        cartItems.length === 0 ||
        !shippingAddress ||
        !shippingAddress.address ||
        !shippingAddress.city ||
        !shippingAddress.zipCode ||
        !shippingAddress.state ||
        !shippingAddress.country
      ) {
        setError(
          "Informations de commande ou de livraison incomplètes. Veuillez vérifier votre panier et votre adresse."
        );
        return;
      }

      try {
        // 2. Créer la commande dans notre base de données
        const orderPayload: OrderPayload = {
          orderItems: cartItems.map((item) => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.images.length > 0 ? item.images[0] : "/placeholder.png",
          })),
          shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            zipCode: shippingAddress.zipCode,
            state: shippingAddress.state,
            country: shippingAddress.country,
          },
          paymentMethod: "stripe",
          itemsPrice: cartTotal,
          shippingPrice: 0, // À implémenter
          taxPrice: 0, // À implémenter
          totalPrice: cartTotal,
        };

        const orderResponse = await apiService.createOrder(orderPayload);
        if (!orderResponse.success || !orderResponse.data) {
          throw new Error(
            orderResponse.message || "La création de la commande a échoué."
          );
        }
        const orderId = orderResponse.data._id;

        // 3. Créer l'intention de paiement sur Stripe
        const amount = Math.round(cartTotal * 100); // En centimes
        const intentResponse = await apiService.createPaymentIntent({
          amount,
          currency: "eur",
          orderId,
        });

        if (!intentResponse.success || !intentResponse.clientSecret) {
          throw new Error(
            intentResponse.message ||
              "La création de l'intention de paiement a échoué."
          );
        }

        setClientSecret(intentResponse.clientSecret);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue.";
        setError(errorMessage);
      }
    };

    initializePayment();
  }, [cartItems, shippingAddress, cartTotal, user]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Paiement</h1>
        <div className="max-w-md mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}

          {!clientSecret && !error && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-green"></div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PaymentPage;
