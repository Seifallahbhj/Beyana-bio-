// src/routes/orderRoutes.ts
import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  generateInvoice,
} from "../controllers/OrderController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// Toutes les routes ici sont protégées
router.use(protect);

router.route("/").post(createOrder);

router.route("/myorders").get(getMyOrders);

// Route pour mettre à jour le statut de la commande (admin seulement)
router.route("/:id/status").put(admin, updateOrderStatus);

// Cette route doit être la dernière pour éviter les conflits avec '/myorders'
router.route("/:id/invoice").get(generateInvoice);
router.route("/:id").get(getOrderById);

export default router;
