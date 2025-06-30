"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/ui/Button";
import { useCart } from "../../contexts/CartContext";

// Ce composant ne dépend plus de useStripe, il lit juste le statut depuis l'URL.
const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const redirectStatus = searchParams.get("redirect_status");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cleared = false;
    if (redirectStatus === "succeeded" && !cleared) {
      setMessage(
        "Paiement réussi ! Votre commande est en cours de préparation. Vous recevrez bientôt un email de confirmation."
      );
      setStatus("success");
      clearCart();
      cleared = true;
    } else {
      switch (redirectStatus) {
        case "processing":
          setMessage(
            "Votre paiement est en cours de traitement. Nous vous tiendrons informé."
          );
          setStatus("loading");
          break;
        case "requires_payment_method":
          setMessage(
            "Échec du paiement. Veuillez réessayer avec un autre moyen de paiement."
          );
          setStatus("error");
          break;
        default:
          setMessage(
            "Une erreur est survenue. Veuillez vérifier votre compte pour le statut de la commande."
          );
          setStatus("error");
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectStatus]);

  // ... (le reste du composant renderContent reste identique)
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-green mb-4"></div>
            <p className="text-lg">Vérification du paiement en cours...</p>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Merci pour votre commande !
            </h1>
            <p className="text-lg mb-6">{message}</p>
            <Link href="/account/orders">
              <Button variant="primary">Voir mes commandes</Button>
            </Link>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Erreur de paiement
            </h1>
            <p className="text-lg mb-6">{message}</p>
            <Link href="/cart">
              <Button variant="danger">Retourner au panier</Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg w-full">
        {renderContent()}
      </div>
    </div>
  );
};

const OrderConfirmationWrapper = () => {
  return (
    <React.Suspense fallback={<div>Chargement...</div>}>
      <OrderConfirmationPage />
    </React.Suspense>
  );
};

export default OrderConfirmationWrapper;
