const request = require("supertest");
const mongoose = require("mongoose");

// Importer l'application après la configuration Jest
let app;
let generateToken;

describe("Review Controller", () => {
  let User, Product, Review, Category;
  let userToken;
  let testUser;
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    // Attendre que la connexion MongoDB soit établie
    await new Promise(resolve => setTimeout(resolve, 100));

    // Importer l'application après la configuration
    app = require("../../app").default;

    // Importer generateToken
    generateToken = require("../../utils/generateToken").default;

    // Importer les modèles après la connexion
    User = mongoose.model("User");
    Product = mongoose.model("Product");
    Review = mongoose.model("Review");
    Category = mongoose.model("Category");
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Category.deleteMany({});

    testUser = await User.create({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });

    testCategory = await Category.create({
      name: "Test Category",
      slug: "test-category",
      description: "Test category for reviews",
    });

    testProduct = await Product.create({
      name: "Test Product",
      descriptionShort: "A short description for testing",
      descriptionDetailed: "A detailed description for testing purposes",
      price: 99.99,
      category: testCategory._id,
      stockQuantity: 10,
      images: ["https://example.com/test-image.jpg"],
    });

    userToken = generateToken(testUser._id);
  });

  describe("POST /api/products/:productId/reviews", () => {
    it("should create a new review when authenticated", async () => {
      const reviewData = {
        rating: 5,
        comment: "Great product!",
        title: "Excellent Quality",
      };
      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Review added");

      const review = await Review.findOne({
        product: testProduct._id,
        user: testUser._id,
      });
      expect(review).toBeTruthy();
      expect(review.rating).toBe(reviewData.rating);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.numReviews).toBe(1);
      expect(updatedProduct.averageRating).toBe(reviewData.rating);
    });

    it("should not create a review without authentication", async () => {
      const reviewData = {
        rating: 5,
        comment: "Great product!",
        title: "Excellent Quality",
      };
      const response = await request(app)
        .post(`/api/products/${testProduct._id}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Not authorized, no token"
      );
    });

    it("should not create a review for non-existent product", async () => {
      const reviewData = {
        rating: 5,
        comment: "Great product!",
        title: "Excellent Quality",
      };
      const nonExistentProductId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/products/${nonExistentProductId}/reviews`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(reviewData)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Product not found");
    });
  });

  describe("GET /api/products/:productId/reviews", () => {
    it("should get all reviews for a product", async () => {
      const anotherUser = await User.create({
        firstName: "Another",
        lastName: "User",
        email: "another@example.com",
        password: "password123",
      });

      await Review.create([
        {
          rating: 4,
          comment: "Good product",
          title: "Good Review",
          user: testUser._id,
          product: testProduct._id,
        },
        {
          rating: 5,
          comment: "Excellent product",
          title: "Excellent Review",
          user: anotherUser._id,
          product: testProduct._id,
        },
      ]);

      const response = await request(app)
        .get(`/api/products/${testProduct._id}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty("rating");
      expect(response.body.data[0].user).toHaveProperty("firstName");
    });

    it("should return empty array for product with no reviews", async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBe(0);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentProductId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${nonExistentProductId}/reviews`)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Product not found");
    });
  });
});
