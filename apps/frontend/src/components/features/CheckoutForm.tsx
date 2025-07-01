"use client";

import React, { useState, FormEvent } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Button from "../ui/Button";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe lira automatiquement le `payment_intent_client_secret` et
        // ajoutera `redirect_status` à l'URL de retour.
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "Une erreur est survenue.");
    } else {
      setMessage("Une erreur inattendue est survenue.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      <Button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        fullWidth
        variant="primary"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
          ) : (
            "Payer maintenant"
          )}
        </span>
      </Button>

      {message && (
        <div
          id="payment-message"
          className="text-red-500 text-sm mt-2 text-center"
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
