import Stripe from "stripe";

// Initialisation de Stripe
let stripe: Stripe;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables"
    );
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
} catch {
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
  // En mode test, on crée un mock
  stripe = {} as Stripe;
}

export default stripe;
