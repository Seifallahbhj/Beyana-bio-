import express from "express";
import {
  createPaymentIntent,
  getStripeConfig,
} from "../controllers/stripeController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route pour créer une intention de paiement (protégée)
router.post("/create-payment-intent", protect, createPaymentIntent);

// Route pour obtenir la configuration Stripe (publique)
router.get("/config", getStripeConfig);

export default router;
