import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from "../controllers/CategoryController";
import { protect, admin } from "../middleware/authMiddleware";
import {
  categoryValidationRules,
  categoryUpdateValidationRules,
  handleValidationErrors,
} from "../middleware/validationMiddleware";
// Importer les validateurs plus tard

const router = express.Router();

// Routes publiques
router.get("/", getCategories);
router.get("/:idOrSlug", getCategoryByIdOrSlug);
router.get("/:slug/products", getCategoryProducts);

// Routes protégées (admin uniquement)
router.post(
  "/",
  protect,
  admin,
  categoryValidationRules,
  handleValidationErrors,
  createCategory
);

router.put(
  "/:id",
  protect,
  admin,
  categoryUpdateValidationRules,
  handleValidationErrors,
  updateCategory
);

router.delete("/:id", protect, admin, deleteCategory);

export default router;
