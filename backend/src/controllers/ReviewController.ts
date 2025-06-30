// src/controllers/ReviewController.ts
import { Response } from "express";
import asyncHandler from "express-async-handler";
import Review from "../models/Review.model";
import Product from "../models/Product.model";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createProductReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { rating, comment, title } = req.body;
    const { productId } = req.params;

    // Vérification de l'authentification
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    // Vérification de la duplication
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400).json({
        success: false,
        message: "Product already reviewed",
      });
      return;
    }

    // Vérification de l'existence du produit
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Création de la review
    const review = await Review.create({
      rating,
      comment,
      title,
      user: req.user._id,
      product: productId,
    });

    // Mise à jour des statistiques du produit
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const averageRating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      numReviews,
      averageRating,
    });

    res.status(201).json({
      success: true,
      message: "Review added",
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        title: review.title,
        user: review.user,
        product: review.product,
        isApproved: review.isApproved,
      },
    });
  }
);

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
    return;
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "firstName lastName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews,
  });
});

export { createProductReview, getProductReviews };
