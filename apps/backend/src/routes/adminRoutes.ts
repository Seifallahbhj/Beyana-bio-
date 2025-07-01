import express from "express";
import {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  loginAdmin,
} from "../controllers/AdminController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// Route de login admin (publique)
router.post("/login", loginAdmin);

// Routes protégées par l'authentification et les droits d'admin
router.use(protect);
router.use(admin);

// Routes du tableau de bord
router.get("/stats", getDashboardStats);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrderStatus);

export default router;
