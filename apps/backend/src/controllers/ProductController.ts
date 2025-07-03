// src/controllers/ProductController.ts
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.model";
import Category from "../models/Category.model";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
// Interface locale pour les filtres MongoDB (spécifique au backend)
interface ProductFilter {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  category?: mongoose.Types.ObjectId | string;
  brand?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  attributes?: { $all: string[] };
  stockQuantity?: { $gt: number };
}

// @desc    Fetch all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sort = (req.query.sort as string) || "-createdAt";

  // Construire le filtre
  const filter: ProductFilter = {};

  // Recherche par mot-clé
  if (req.query.keyword) {
    const keyword = req.query.keyword as string;
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { descriptionShort: { $regex: keyword, $options: "i" } },
      { descriptionDetailed: { $regex: keyword, $options: "i" } },
    ];
  }

  // Filtrage par catégorie (gestion des slugs)
  if (req.query.category) {
    const categoryParam = req.query.category as string;

    // Vérifier si c'est un ObjectId valide
    if (categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
      // C'est un ObjectId, utiliser directement
      filter.category = categoryParam;
    } else {
      // C'est probablement un slug, chercher la catégorie d'abord
      try {
        const category = await Category.findOne({ slug: categoryParam });
        if (category) {
          filter.category = category._id as mongoose.Types.ObjectId;
        } else {
          // Si la catégorie n'existe pas, retourner une liste vide
          res.json({
            success: true,
            data: {
              products: [],
              page,
              pages: 0,
              total: 0,
              facets: {
                brands: [],
                categories: [],
                priceRange: { minPrice: 0, maxPrice: 0 },
              },
            },
          });
          return;
        }
      } catch {
        // Suppression du console.error pour éviter le warning
        res.status(500).json({
          success: false,
          message: "Erreur lors du filtrage par catégorie",
        });
        return;
      }
    }
  }

  // Filtrage par marque
  if (req.query.brand) {
    filter.brand = req.query.brand as string;
  }

  // Filtrage par prix
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      filter.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.price.$lte = Number(req.query.maxPrice);
    }
  }

  // Filtrage par attributs (bio, vegan, etc.)
  if (req.query.attributes) {
    const attributes = (req.query.attributes as string).split(",");
    filter.attributes = { $all: attributes };
  }

  // Filtrage par disponibilité
  if (req.query.inStock === "true") {
    filter.stockQuantity = { $gt: 0 };
  }

  // Exécuter la requête avec le filtre, le tri et la pagination
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("category", "name slug");

  // Récupérer les facettes pour le filtrage
  const brands = await Product.distinct("brand");
  const categoryIds = await Product.distinct("category");
  const categoriesDocs = await Category.find({
    _id: { $in: categoryIds },
  }).select("name _id");
  const categories = categoriesDocs.map(cat => ({
    _id: cat._id,
    name: cat.name,
  }));
  const priceRange = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
      facets: {
        brands,
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      },
    },
  });
});

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find({ isFeatured: true })
      .limit(8)
      .populate("category", "name");

    // Envelopper la réponse pour correspondre à la structure ApiResponse<T> du frontend
    res.json({
      success: true,
      data: products,
      message: "Featured products fetched successfully",
    });
  }
);

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({
      success: false,
      error: "Produit non trouvé",
    });
  }
});

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Le middleware 'protect' garantit que req.user est défini.
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    const product = new Product({
      ...req.body,
      user: req.user._id, // Associer le produit à l'admin qui le crée
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    price,
    descriptionShort,
    descriptionDetailed,
    brand,
    category,
    stockQuantity,
    images,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price === undefined ? product.price : price;
    product.descriptionShort = descriptionShort || product.descriptionShort;
    product.descriptionDetailed =
      descriptionDetailed || product.descriptionDetailed;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stockQuantity =
      stockQuantity === undefined ? product.stockQuantity : stockQuantity;
    product.images = images || product.images;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

export {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
};
