const request = require("supertest");
const mongoose = require("mongoose");

// Importer l'application après la configuration Jest
let app;
let generateToken;

// Données de test réutilisables
const mockShippingAddress = {
  address: "123 Test St",
  city: "Testville",
  state: "Testland",
  zipCode: "12345",
  country: "Testania",
};

describe("Order Controller", () => {
  jest.setTimeout(60000);
  let adminToken;
  let adminUser;
  let customerToken;
  let customerUser;
  let testProduct;
  let testCategory;
  let testOrder;
  let mockOrderPayload;
  let User, Product, Category, Order;

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
    Category = mongoose.model("Category");
    Order = mongoose.model("Order");
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: "Test Category",
      description: "Test category description",
    });

    // Créer un produit de test
    testProduct = await Product.create({
      name: "Test Product",
      descriptionShort: "Short test product description",
      descriptionDetailed: "Detailed test product description",
      price: 29.99,
      category: testCategory._id,
      images: ["https://example.com/image.jpg"],
      stockQuantity: 10,
      isActive: true,
    });

    // Créer le payload de commande MOCK une fois que testProduct est disponible
    mockOrderPayload = {
      orderItems: [
        {
          name: testProduct.name,
          quantity: 1,
          image: testProduct.images[0],
          price: testProduct.price,
          product: testProduct._id,
        },
      ],
      shippingAddress: mockShippingAddress,
      paymentMethod: "stripe",
      itemsPrice: testProduct.price,
      shippingPrice: 10,
      taxPrice: 5,
      totalPrice: testProduct.price + 10 + 5,
    };

    // Créer un utilisateur admin
    adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(adminUser._id);

    // Créer un utilisateur client
    customerUser = await User.create({
      firstName: "Customer",
      lastName: "User",
      email: "customer@test.com",
      password: "password123",
      role: "customer",
    });
    customerToken = generateToken(customerUser._id);

    // Créer une commande de test pour les scénarios GET/PUT
    testOrder = await Order.create({
      ...mockOrderPayload,
      user: customerUser._id,
    });
  });

  describe("POST /api/orders", () => {
    it("should create a new order when customer is authenticated", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(mockOrderPayload)
        .expect(201);

      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.user).toBe(customerUser._id.toString());
      expect(response.body.data.totalPrice).toBe(mockOrderPayload.totalPrice);
    });

    it("should not create an order without authentication", async () => {
      await request(app).post("/api/orders").send(mockOrderPayload).expect(401);
    });

    it("should return 400 for invalid data (e.g., no items)", async () => {
      const invalidPayload = { ...mockOrderPayload, orderItems: [] };
      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe("GET /api/orders", () => {
    it("should get all orders for admin", async () => {
      const response = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.orders).toBeInstanceOf(Array);
      expect(response.body.orders.length).toBeGreaterThanOrEqual(1);
    });

    it("should get only user orders for customer", async () => {
      const response = await request(app)
        .get("/api/orders/myorders")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].user).toBe(customerUser._id.toString());
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get order by id for admin", async () => {
      const orderId = testOrder.id;
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
    });

    it("should get own order for customer", async () => {
      const orderId = testOrder.id;
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
    });
  });

  describe("PUT /api/orders/:id/status", () => {
    it("should update order status when admin is authenticated", async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Shipped" })
        .expect(200);

      expect(response.body.data.orderStatus).toBe("Shipped");
    });

    it("should not update order status if not admin", async () => {
      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ status: "Shipped" })
        .expect(403);
    });
  });
});
