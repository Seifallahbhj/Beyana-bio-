import request from "supertest";
import app from "../../app";
import User, { IUser } from "../../models/User.model";
import Order, { IOrder } from "../../models/Order.model";
import Product from "../../models/Product.model";
import generateToken from "../../utils/generateToken";
import mongoose from "mongoose";

describe("Admin Controller", () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: IUser;
  let normalUser: IUser;
  let orderId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});

    adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(adminUser._id);

    normalUser = await User.create({
      firstName: "Normal",
      lastName: "User",
      email: "user@example.com",
      password: "password123",
      role: "customer",
    });
    userToken = generateToken(normalUser._id);

    const order: IOrder = await Order.create({
      user: normalUser._id,
      orderItems: [
        {
          name: "Test Product",
          quantity: 1,
          image: "/images/test.jpg",
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
      paymentMethod: "PayPal",
      totalPrice: 100,
      isPaid: true,
      paidAt: new Date(),
      orderStatus: "Processing",
    });
    orderId = String(order._id);
  });

  describe("GET /api/admin/stats", () => {
    it("should return dashboard stats for admin", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalUsers).toBe(2);
      expect(res.body.stats.totalOrders).toBe(1);
    });

    it("should return 401 for non-admin user", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/orders", () => {
    it("should return orders for admin", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
    });

    it("should filter orders by status", async () => {
      const res = await request(app)
        .get("/api/admin/orders?status=Processing")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.orders[0].orderStatus).toBe("Processing");
    });
  });

  describe("PUT /api/admin/orders/:id", () => {
    it("should update order status for admin", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(200);
      expect(res.body.orderStatus).toBe("Shipped");
    });

    it("should return 404 if order not found", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/admin/orders/${invalidId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(404);
    });
  });
});
