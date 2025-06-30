import request from "supertest";
import app from "../../app";
import Order, { IOrder } from "../../models/Order.model";
import User, { IUser } from "../../models/User.model";
import Product, { IProduct } from "../../models/Product.model";
import Category, { ICategory } from "../../models/Category.model";
import generateToken from "../../utils/generateToken";
import mongoose, { HydratedDocument } from "mongoose";

// Données de test réutilisables
const mockShippingAddress = {
  address: "123 Test St",
  city: "Testville",
  state: "Testland",
  zipCode: "12345",
  country: "Testania",
};

type MockOrderPayload = {
  orderItems: Array<{
    name: string;
    quantity: number;
    image: string;
    price: number;
    product: mongoose.Types.ObjectId;
  }>;
  shippingAddress: typeof mockShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

describe("Order Controller", () => {
  jest.setTimeout(60000);
  let adminToken: string;
  let adminUser: IUser;
  let customerToken: string;
  let customerUser: IUser;
  let testProduct: HydratedDocument<IProduct>;
  let testCategory: HydratedDocument<ICategory>;
  let testOrder: HydratedDocument<IOrder>;
  let mockOrderPayload: MockOrderPayload;

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
          product: testProduct._id as mongoose.Types.ObjectId,
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

    it("should return 400 for non-existent product", async () => {
      const invalidPayload = {
        ...mockOrderPayload,
        orderItems: [
          {
            ...mockOrderPayload.orderItems[0],
            product: new mongoose.Types.ObjectId(),
          },
        ],
      };
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

    it("should not get orders without authentication", async () => {
      await request(app).get("/api/orders").expect(401);
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

    it("should return 403 when customer tries to get another user's order", async () => {
      const otherUser = await User.create({
        firstName: "Other",
        lastName: "User",
        email: "other@test.com",
        password: "password123",
      });

      const otherOrder = await Order.create({
        ...mockOrderPayload,
        user: otherUser._id,
      });

      await request(app)
        .get(`/api/orders/${otherOrder.id}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(403);
    });

    it("should return 404 for non-existent order", async () => {
      const nonExistentOrderId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/orders/${nonExistentOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
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

    it("should not update order status with invalid status", async () => {
      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "invalid_status" })
        .expect(400);
    });
  });
});
