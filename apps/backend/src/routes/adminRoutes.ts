import express from "express";
import {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  exportOrdersCSV,
  exportOrdersPDF,
  loginAdmin,
  getUsers,
  updateUserRole,
  deleteUser,
  getOrderById,
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
router.get("/orders/export/csv", exportOrdersCSV);
router.get("/orders/export/pdf", exportOrdersPDF);
router.put("/orders/:id", updateOrderStatus);
router.get("/orders/:id", getOrderById);

// Routes de gestion des utilisateurs
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
