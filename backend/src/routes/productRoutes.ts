// src/routes/productRoutes.ts
import express from "express";
import { body } from "express-validator";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from "../controllers/ProductController";
import {
  createProductReview,
  getProductReviews,
} from "../controllers/ReviewController";
import { protect, admin } from "../middleware/authMiddleware";
import { handleValidationErrors } from "../middleware/validationMiddleware";

const router = express.Router();

// Règles de validation pour les produits
const productCreateValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .trim()
    .escape(),
  body("descriptionShort")
    .notEmpty()
    .withMessage("Short description is required")
    .trim()
    .escape(),
  body("descriptionDetailed")
    .notEmpty()
    .withMessage("Detailed description is required")
    .trim()
    .escape(),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("category").isMongoId().withMessage("A valid category ID is required"),
  body("stockQuantity")
    .isInt({ gt: -1 })
    .withMessage("Stock quantity must be a non-negative integer"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*").isURL().withMessage("Each image must be a valid URL"),
  body("brand").optional({ checkFalsy: true }).trim().escape(),
];

// Règles de validation pour la mise à jour des produits (tous les champs sont optionnels)
const productUpdateValidationRules = [
  body("name").optional().trim().escape(),
  body("descriptionShort").optional().trim().escape(),
  body("descriptionDetailed").optional().trim().escape(),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("A valid category ID is required"),
  body("stockQuantity")
    .optional()
    .isInt({ gt: -1 })
    .withMessage("Stock quantity must be a non-negative integer"),
  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),
  body("brand").optional({ checkFalsy: true }).trim().escape(),
];

// Règles de validation pour les reviews
const reviewValidationRules = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .notEmpty()
    .withMessage("Comment is required")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
];

// --- Définition des Routes ---

// @route   GET /api/products
// @desc    Récupérer tous les produits (avec filtres, tri, pagination)
// @access  Public
router.route("/").get(getProducts);

// @route   POST /api/products
// @desc    Créer un nouveau produit
// @access  Private/Admin
router
  .route("/")
  .post(
    protect,
    admin,
    productCreateValidationRules,
    handleValidationErrors,
    createProduct
  );

// @route   GET /api/products/featured
// @desc    Récupérer les produits en vedette
// @access  Public
router.route("/featured").get(getFeaturedProducts);

// @route   GET /api/products/slug/:slug
// @desc    Récupérer un produit par son slug
// @access  Public
router.route("/slug/:slug").get(getProductBySlug);

// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
router.route("/:id").get(getProductById);

// @route   PUT /api/products/:id
// @desc    Mettre à jour un produit
// @access  Private/Admin
router
  .route("/:id")
  .put(
    protect,
    admin,
    productUpdateValidationRules,
    handleValidationErrors,
    updateProduct
  );

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
// @access  Private/Admin
router.route("/:id").delete(protect, admin, deleteProduct);

// --- Routes pour les avis sur les produits ---

// @route   POST /api/products/:productId/reviews
// @desc    Créer un nouvel avis sur un produit
// @access  Private
router
  .route("/:productId/reviews")
  .post(
    protect,
    reviewValidationRules,
    handleValidationErrors,
    createProductReview
  )
  .get(getProductReviews);

export default router;
