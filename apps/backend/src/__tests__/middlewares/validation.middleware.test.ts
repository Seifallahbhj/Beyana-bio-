import request from "supertest";
import app from "../../app";
import User from "../../models/User.model";
import generateToken from "../../utils/generateToken";
import mongoose from "mongoose";
import Order from "../../models/Order.model";

describe("Validation Middleware", () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Nettoyer la base de données
    await User.deleteMany({});

    // Créer un utilisateur admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });
    adminToken = generateToken(admin._id);

    // Créer un utilisateur de test
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "customer",
      firstName: "Test",
      lastName: "User",
    });
    userToken = generateToken(user._id);
  });

  describe("User Registration Validation", () => {
    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Please provide firstName, lastName, email, and password"
      );
    });

    it("should validate email format", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          email: "invalid-email",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });

    it("should validate password strength", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          email: "new@example.com",
          password: "123",
          firstName: "Test",
          lastName: "User",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });
  });

  describe("Product Validation", () => {
    it("should validate product creation fields", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });

    it("should validate product price", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Product",
          price: -10,
          category: "valid-category-id",
          stockQuantity: 10,
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });

    it("should validate stock quantity", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Product",
          price: 10,
          category: "valid-category-id",
          stockQuantity: -5,
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });
  });

  describe("Order Validation", () => {
    it("should validate order items", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderItems: [],
          shippingAddress: {
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            zipCode: "12345",
            country: "Test Country",
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("No order items");
    });

    it("should validate shipping address", async () => {
      // Créer un produit valide pour le test
      const Product = require("../../models/Product.model").default;
      const Category = require("../../models/Category.model").default;

      const category = await Category.create({
        name: "Test Category",
        description: "Test category description",
      });

      const product = await Product.create({
        name: "Test Product",
        descriptionShort: "Short test product description",
        descriptionDetailed: "Detailed test product description",
        price: 29.99,
        category: category._id,
        images: ["https://example.com/image.jpg"],
        stockQuantity: 10,
        isActive: true,
      });

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          orderItems: [
            {
              product: product._id,
              quantity: 1,
              name: "Test Product",
              image: "test.jpg",
              price: 100,
            },
          ],
          shippingAddress: {
            city: "Test City",
            // Manque address, state, zipCode, country
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message.toLowerCase()).toMatch(
        /shippingaddress|is required/
      );
    });
  });

  describe("Category Validation", () => {
    it("should validate category name", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
          description: "Test description",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/payment/webhook", () => {
    it("should process a successful payment intent webhook", async () => {
      // Utilise un ObjectId valide pour l'Order
      const orderObjectId = new mongoose.Types.ObjectId();

      await Order.create({
        _id: orderObjectId,
        user: new mongoose.Types.ObjectId(),
        orderItems: [
          {
            name: "Test Product",
            quantity: 1,
            image: "/test.jpg",
            price: 100,
            product: new mongoose.Types.ObjectId(),
          },
        ],
        shippingAddress: {
          address: "123 Test St",
          city: "Testville",
          state: "Test State",
          zipCode: "12345",
          country: "Testland",
        },
        paymentMethod: "stripe",
        itemsPrice: 100,
        shippingPrice: 10,
        taxPrice: 0,
        totalPrice: 110,
        isPaid: false,
        isDelivered: false,
      });

      // Mets à jour le payload pour utiliser l'ObjectId
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_1234567890",
            status: "succeeded",
            metadata: { orderId: orderObjectId.toHexString() },
            receipt_email: "test@example.com",
          },
        },
      };

      const response = await request(app)
        .post("/api/payment/webhook")
        .set("Content-Type", "application/json")
        .send(Buffer.from(JSON.stringify(payload)))
        .expect(200);

      expect(response.body.received).toBe(true);
    });
  });
});
