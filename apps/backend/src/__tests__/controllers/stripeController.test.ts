const request = require("supertest");
const mongoose = require("mongoose");

// Importer l'application après la configuration Jest
let app;
let generateToken;

describe("Stripe Controller", () => {
  let User, Product, Order, Category;
  let userToken;
  let testUser;
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
  });
});
