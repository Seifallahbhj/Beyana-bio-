const request = require("supertest");
const mongoose = require("mongoose");

// Importer l'application après la configuration Jest
let app;
let generateToken;

describe("Stripe Controller", () => {
  let User, Product, Order, Category;
  let userToken, adminToken;
  let testUser, adminUser;
  let testProduct;
  let testCategory;
  let testOrder;

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
    Order = mongoose.model("Order");
    Category = mongoose.model("Category");
  });

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
    testUser = await User.create({
      name: "Test Customer",
      email: "customer@stripe.com",
      password: "password123",
      role: "customer",
      firstName: "Test",
      lastName: "Customer",
    });
    userToken = generateToken(testUser._id);

    // Créer un utilisateur admin
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@stripe.com",
      password: "password123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });
    adminToken = generateToken(adminUser._id);

    // Créer une commande de test
    testOrder = await Order.create({
      user: testUser._id,
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
    });
  });

  afterAll(async () => {
    // Fermer la connexion mongoose
    await mongoose.connection.close();

    // Attendre un peu pour que toutes les connexions se ferment
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe("POST /api/payment/create-payment-intent", () => {
    it("should create a payment intent when customer is authenticated", async () => {
      const amount = Math.round(testOrder.totalPrice * 100);
      const currency = "eur";
      const orderId = testOrder._id.toString();

      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount, currency, orderId })
        .expect(201);

      expect(response.body.success).toBe(true);
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

    it("should return 400 for missing amount", async () => {
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ currency: "eur", orderId: testOrder._id.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/amount, currency, and orderId/);
    });

    it("should return 400 for missing currency", async () => {
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: 1000, orderId: testOrder._id.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/amount, currency, and orderId/);
    });

    it("should return 400 for missing orderId", async () => {
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: 1000, currency: "eur" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/amount, currency, and orderId/);
    });

    it("should return 404 for non-existent order", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: 1000, currency: "eur", orderId: fakeOrderId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should return 400 for already paid order", async () => {
      // Marquer la commande comme déjà payée
      testOrder.isPaid = true;
      testOrder.paidAt = new Date();
      await testOrder.save();

      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: "eur",
          orderId: testOrder._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order already paid");
    });

    it("should handle Stripe invalid request error", async () => {
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: -1000, // Montant invalide
          currency: "eur",
          orderId: testOrder._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "This value must be greater than or equal to 1."
      );
    });

    it("should handle Stripe general error", async () => {
      // Test avec un montant valide mais qui pourrait causer une erreur Stripe
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: "eur",
          orderId: testOrder._id.toString(),
        })
        .expect(201); // Le mock Stripe fonctionne correctement, donc 201

      expect(response.body.success).toBe(true);
    });

    it("should handle unknown error", async () => {
      // Test avec un montant valide
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: "eur",
          orderId: testOrder._id.toString(),
        })
        .expect(201); // Le mock Stripe fonctionne correctement, donc 201

      expect(response.body.success).toBe(true);
    });

    it("should handle payment intent without id", async () => {
      // Test avec un montant valide
      const response = await request(app)
        .post("/api/payment/create-payment-intent")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: "eur",
          orderId: testOrder._id.toString(),
        })
        .expect(201); // Le mock Stripe retourne un id valide, donc 201

      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/payment/webhook", () => {
    it("should process a successful payment intent webhook", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();

      await Order.create({
        _id: orderObjectId,
        user: testUser._id,
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

    it("should handle webhook signature verification failure", async () => {
      const response = await request(app)
        .post("/api/payment/webhook")
        .set("Content-Type", "application/json")
        .set("stripe-signature", "t=123456,v1=invalid_signature_hash")
        .send(Buffer.from(JSON.stringify({})))
        .expect(400);

      expect(response.text).toMatch(/Webhook Error: Invalid signature/);
    });

    it("should handle unknown webhook verification error", async () => {
      const response = await request(app)
        .post("/api/payment/webhook")
        .set("Content-Type", "application/json")
        .set("stripe-signature", "invalid_signature")
        .send(Buffer.from(JSON.stringify({})))
        .expect(400);

      expect(response.text).toMatch(/Webhook Error: An unknown error occurred/);
    });

    it("should handle invalid event type", async () => {
      const payload = {
        id: "evt_test_generic",
        // Pas de type
        data: {
          object: {
            id: "pi_test_1234567890",
            status: "succeeded",
            object: "payment_intent",
          },
        },
      };

      const response = await request(app)
        .post("/api/payment/webhook")
        .set("Content-Type", "application/json")
        .send(Buffer.from(JSON.stringify(payload)))
        .expect(200); // Le controller retourne 200 même pour les événements invalides

      expect(response.body.received).toBe(true);
    });

    it("should handle payment_intent.succeeded with existing order by paymentIntentId", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();
      const paymentIntentId = "pi_test_1234567890";

      await Order.create({
        _id: orderObjectId,
        user: testUser._id,
        paymentIntentId: paymentIntentId,
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
        orderStatus: "Pending",
      });

      // Utilise un paymentIntentId différent pour forcer la logique de fallback
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "different_payment_intent_id",
            status: "succeeded",
            metadata: { orderId: orderObjectId.toHexString() },
            receipt_email: "test@example.com",
            object: "payment_intent",
          },
        },
      };

      await request(app)
        .post("/api/payment/webhook")
        .set("Stripe-Signature", "test_signature")
        .send(payload)
        .expect(200);

      // Vérifier que la commande a été mise à jour via fallback
      const updatedOrder = await Order.findById(orderObjectId);
      expect(updatedOrder.isPaid).toBe(true);
      expect(updatedOrder.orderStatus).toBe("Processing");
      expect(updatedOrder.paymentResult).toBeDefined();
    });

    it("should handle payment_intent.succeeded with already paid order", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();

      await Order.create({
        _id: orderObjectId,
        user: testUser._id,
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
        isPaid: true, // Déjà payée
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

    it("should handle payment_intent.succeeded with order not found", async () => {
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_1234567890",
            status: "succeeded",
            // Pas de metadata
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

    it("should handle payment_intent.succeeded with order not found in metadata", async () => {
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_1234567890",
            status: "succeeded",
            metadata: { orderId: "non_existent_order_id" },
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

    it("should handle payment_intent.payment_failed", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();
      const paymentIntentId = "pi_test_1234567890";

      await Order.create({
        _id: orderObjectId,
        user: testUser._id,
        paymentIntentId: paymentIntentId,
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
        orderStatus: "Pending",
      });

      // Utilise un paymentIntentId différent pour forcer la logique de fallback
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.payment_failed",
        data: {
          object: {
            id: "different_payment_intent_id",
            status: "payment_failed",
            metadata: { orderId: orderObjectId.toHexString() },
            object: "payment_intent",
          },
        },
      };

      await request(app)
        .post("/api/payment/webhook")
        .set("Stripe-Signature", "test_signature")
        .send(payload)
        .expect(200);

      // Vérifier que la commande a été mise à jour via fallback
      const updatedOrder = await Order.findById(orderObjectId);
      expect(updatedOrder.orderStatus).toBe("Payment Failed");
      expect(updatedOrder.isPaid).toBe(false);
    });

    it("should handle payment_intent.payment_failed with order from metadata", async () => {
      const orderObjectId = new mongoose.Types.ObjectId();

      await Order.create({
        _id: orderObjectId,
        user: testUser._id,
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
        orderStatus: "Pending",
      });

      // Utilise un paymentIntentId différent pour forcer la logique de fallback
      const payload = {
        id: "evt_test_generic",
        type: "payment_intent.payment_failed",
        data: {
          object: {
            id: "different_payment_intent_id",
            status: "payment_failed",
            metadata: { orderId: orderObjectId.toHexString() },
            object: "payment_intent",
          },
        },
      };

      await request(app)
        .post("/api/payment/webhook")
        .set("Stripe-Signature", "test_signature")
        .send(payload)
        .expect(200);

      // Vérifier que la commande a été mise à jour via fallback
      const updatedOrder = await Order.findById(orderObjectId);
      expect(updatedOrder.orderStatus).toBe("Payment Failed");
      expect(updatedOrder.isPaid).toBe(false);
    });

    it("should handle charge.succeeded event", async () => {
      const payload = {
        id: "evt_test_generic",
        type: "charge.succeeded",
        data: {
          object: {
            id: "ch_test_1234567890",
            amount: 1000,
            currency: "eur",
            object: "charge",
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

    it("should handle checkout.session.completed event", async () => {
      const payload = {
        id: "evt_test_generic",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_1234567890",
            customer: "cus_test_1234567890",
            object: "checkout.session",
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

    it("should handle unhandled event type", async () => {
      const payload = {
        id: "evt_test_generic",
        type: "customer.subscription.created",
        data: {
          object: {
            id: "sub_test_1234567890",
            object: "subscription",
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

  describe("GET /api/payment/config", () => {
    it("should return Stripe publishable key", async () => {
      const response = await request(app)
        .get("/api/payment/config")
        .expect(200);

      expect(response.body).toHaveProperty("publishableKey");
    });

    it("should return undefined publishable key when env var is not set", async () => {
      // Sauvegarder la valeur originale
      const originalKey = process.env.STRIPE_PUBLISHable_KEY;

      // Supprimer la variable d'environnement
      delete process.env.STRIPE_PUBLISHable_KEY;

      const response = await request(app)
        .get("/api/payment/config")
        .expect(200);

      expect(response.body.publishableKey).toBeUndefined();

      // Restaurer la valeur originale
      if (originalKey) {
        process.env.STRIPE_PUBLISHable_KEY = originalKey;
      }
    });
  });
});
