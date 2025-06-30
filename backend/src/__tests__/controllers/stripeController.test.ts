import request from "supertest";
import app from "../../app";
import User, { IUser } from "../../models/User.model";
import generateToken from "../../utils/generateToken";
import dotenv from "dotenv";
import Order, { IOrder } from "../../models/Order.model";
import Product, { IProduct } from "../../models/Product.model";
import Category, { ICategory } from "../../models/Category.model";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import mongoose from "mongoose";

dotenv.config();

describe("Stripe Controller", () => {
  let customerToken: string;
  let customerUser: IUser;
  let testProduct: HydratedDocument<IProduct>;
  let testCategory: HydratedDocument<ICategory>;
  let testOrder: HydratedDocument<IOrder>;

  beforeEach(async () => {
    // Nettoyer la base de données
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: "Test Category",
      slug: "test-category",
      description: "Test category description",
    });

    // Créer un produit de test
    testProduct = await Product.create({
      name: "Test Product",
      slug: "test-product",
      descriptionShort: "Short test product description",
      descriptionDetailed: "Detailed test product description",
      price: 29.99,
      category: testCategory._id,
      images: ["https://example.com/image.jpg"],
      stockQuantity: 10,
      isActive: true,
    });

    // Créer un utilisateur client
    customerUser = await User.create({
      name: "Test Customer",
      email: "customer@stripe.com",
      password: "password123",
      role: "customer",
      firstName: "Test",
      lastName: "Customer",
    });
    customerToken = generateToken(customerUser._id);

    // Créer une commande de test
    testOrder = (await Order.create({
      user: customerUser._id,
      orderItems: [
        {
          name: testProduct.name,
          quantity: 1,
          image: testProduct.images[0] || "",
          price: testProduct.price,
          product: testProduct._id,
        },
      ],
      shippingAddress: {
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: "card",
      itemsPrice: testProduct.price,
      taxPrice: testProduct.price * 0.15,
      shippingPrice: 0,
      totalPrice: testProduct.price + testProduct.price * 0.15,
      orderStatus: "Pending",
    })) as HydratedDocument<IOrder>;
  });

  afterAll(async () => {
    // Fermer la connexion mongoose
    await mongoose.connection.close();

    // Attendre un peu pour que toutes les connexions se ferment
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe("POST /api/payment/create-payment-intent", () => {
    it("should create a payment intent when customer is authenticated", async () => {
      const amount = Math.round(testOrder.totalPrice * 100);
      const currency = "eur";
      const orderId = (testOrder._id as Types.ObjectId).toString();

      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount, currency, orderId })
        .expect(201);

      expect(response.body).toHaveProperty("clientSecret");
      expect(typeof response.body.clientSecret).toBe("string");
      expect(response.body).toHaveProperty("amount");
      expect(response.body.amount).toBe(amount);
      expect(response.body).toHaveProperty("currency");
      expect(response.body.currency).toBe(currency);
    });

    it("should return 401 if not authenticated", async () => {
      const amount = 1000;
      const currency = "eur";
      const orderId = testOrder._id;

      await request(app)
        .post("/api/payment/create-payment-intent")
        .send({ amount, currency, orderId })
        .expect(401);
    });

    it("should return 400 if amount or currency is missing/invalid", async () => {
      const orderId = testOrder._id;

      // Test avec montant manquant
      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ currency: "eur", orderId })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "Please provide amount, currency, and orderId"
          );
        });

      // Test avec devise manquante
      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount: 1000, orderId })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "Please provide amount, currency, and orderId"
          );
        });

      // Test avec montant invalide (négatif)
      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount: -100, currency: "eur", orderId })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "This value must be greater than or equal to 1."
          ); // Updated message from Stripe
        });

      // Test avec orderId manquant
      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount: 1000, currency: "eur" })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "Please provide amount, currency, and orderId"
          );
        });
    });

    it("should return 404 if order not found", async () => {
      const amount = 1000;
      const currency = "eur";
      const nonExistentOrderId = new Types.ObjectId().toString();

      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount, currency, orderId: nonExistentOrderId })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe("Order not found");
        });
    });

    it("should return 400 if order is already paid", async () => {
      // Marquer la commande comme payée
      testOrder.isPaid = true;
      await testOrder.save();

      const amount = Math.round(testOrder.totalPrice * 100);
      const currency = "eur";
      const orderId = (testOrder._id as Types.ObjectId).toString();

      await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount, currency, orderId })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Order already paid");
        });
    });
  });

  describe("POST /api/payment/webhook", () => {
    it("should process a successful payment intent webhook", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();

      await Order.create({
        _id: orderObjectId,
        user: customerUser._id,
        orderItems: [
          {
            name: "Test Product",
            quantity: 1,
            image: "/test.jpg",
            price: 100,
            product: testProduct._id,
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

      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_1234567890",
            status: "succeeded",
            metadata: { orderId: orderObjectId.toHexString() },
            receipt_email: "test@example.com",
            object: "payment_intent",
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

    it("should return 400 for invalid webhook signature", async () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            status: "succeeded",
          },
        },
      };
      const invalidSignature = "t=123456,v1=invalid_signature_hash";
      const payload = JSON.stringify(event);

      await request(app)
        .post("/api/payment/webhook")
        .set("stripe-signature", invalidSignature)
        .set("Content-Type", "application/json")
        .send(Buffer.from(payload))
        .expect(400);
    });

    it("should handle payment intent failure", async () => {
      // Mettre à jour la commande de test avec l'ID de l'intention de paiement
      testOrder.paymentIntentId = "pi_test_1234567890";
      await testOrder.save();

      // Simuler l'événement d'échec de paiement
      const event = {
        id: "evt_test_" + Date.now(),
        object: "event",
        api_version: "2020-08-27",
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: "pi_test_1234567890",
            object: "payment_intent",
            amount: Math.round(testOrder.totalPrice * 100),
            currency: "eur",
            status: "failed",
            metadata: {
              userId: customerUser._id.toString(),
              orderId: (testOrder._id as Types.ObjectId).toString(),
            },
          },
        },
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        type: "payment_intent.payment_failed",
      };

      // Générer la signature du webhook avec le mock
      const payload = JSON.stringify(event);
      const signature = "test_signature";

      const response = await request(app)
        .post("/api/payment/webhook")
        .set("stripe-signature", signature)
        .set("Content-Type", "application/json")
        .send(Buffer.from(payload))
        .expect(200);

      expect(response.body.received).toBe(true);
    });
  });
});
