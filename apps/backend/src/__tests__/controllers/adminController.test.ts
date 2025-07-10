import request from "supertest";
import app from "../../app";
import User from "../../models/User.model";
import Order, { IOrder } from "../../models/Order.model";
import Product from "../../models/Product.model";
import generateToken from "../../utils/generateToken";
import mongoose from "mongoose";

describe("Admin Controller", () => {
  let adminToken;
  let userToken;
  let adminUser;
  let normalUser;
  let orderId;

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

    it("should support pagination", async () => {
      // Crée plusieurs commandes pour tester la pagination
      for (let i = 0; i < 15; i++) {
        await Order.create({
          user: normalUser._id,
          orderItems: [
            {
              name: `Product ${i}`,
              quantity: 1,
              image: "/images/test.jpg",
              price: 100 + i,
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
          totalPrice: 100 + i,
          isPaid: true,
          paidAt: new Date(),
          orderStatus: "Processing",
        });
      }
      const res = await request(app)
        .get("/api/admin/orders?page=2&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      expect(res.body.page).toBe(2);
      expect(res.body.pages).toBeGreaterThanOrEqual(2);
    });

    it("should support sorting by totalPrice ascending", async () => {
      // Crée deux commandes avec des prix différents
      await Order.create({
        user: normalUser._id,
        orderItems: [
          {
            name: "Low Price Product",
            quantity: 1,
            image: "/images/test.jpg",
            price: 10,
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
        totalPrice: 10,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Processing",
      });
      await Order.create({
        user: normalUser._id,
        orderItems: [
          {
            name: "High Price Product",
            quantity: 1,
            image: "/images/test.jpg",
            price: 1000,
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
        totalPrice: 1000,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Processing",
      });
      const res = await request(app)
        .get("/api/admin/orders?sort=totalPrice")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const prices = res.body.orders.map(
        (o: { totalPrice: number }) => o.totalPrice
      );
      // Vérifie que le tri est croissant
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it("should filter by minAmount and maxAmount", async () => {
      // Nettoyer la collection pour ce test
      await Order.deleteMany({});
      await User.deleteMany({});

      // Crée un user et un token admin pour ce test
      const adminUser = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin2@example.com",
        password: "password123",
        role: "admin",
      });
      const adminToken = generateToken(adminUser._id);

      // Crée une commande dans la plage
      await Order.create({
        user: adminUser._id,
        orderItems: [
          {
            name: "Mid Price Product",
            quantity: 1,
            image: "/images/test.jpg",
            price: 500,
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
        itemsPrice: 400,
        taxPrice: 50,
        shippingPrice: 50,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Processing",
      });

      // Crée une commande hors plage
      await Order.create({
        user: adminUser._id,
        orderItems: [
          {
            name: "Low Price Product",
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
        itemsPrice: 80,
        taxPrice: 10,
        shippingPrice: 10,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Processing",
      });

      const res = await request(app)
        .get("/api/admin/orders?minAmount=400&maxAmount=600")
        .set("Authorization", `Bearer ${adminToken}`);

      console.log("ORDERS:", res.body.orders);

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      for (const order of res.body.orders) {
        expect(order.totalPrice).toBeGreaterThanOrEqual(400);
        expect(order.totalPrice).toBeLessThanOrEqual(600);
      }
    });

    it("should filter orders by user ID", async () => {
      const res = await request(app)
        .get(`/api/admin/orders?user=${normalUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      for (const order of res.body.orders) {
        expect(order.user._id.toString()).toBe(normalUser._id.toString());
      }
    });

    it("should filter orders by email", async () => {
      const res = await request(app)
        .get(`/api/admin/orders?email=${normalUser.email}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      for (const order of res.body.orders) {
        expect(order.user._id.toString()).toBe(normalUser._id.toString());
      }
    });

    it("should filter orders by name (firstName)", async () => {
      const res = await request(app)
        .get("/api/admin/orders?name=Normal")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      for (const order of res.body.orders) {
        expect(order.user._id.toString()).toBe(normalUser._id.toString());
      }
    });

    it("should filter orders by name (lastName)", async () => {
      const res = await request(app)
        .get("/api/admin/orders?name=User")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      for (const order of res.body.orders) {
        expect(order.user._id.toString()).toBe(normalUser._id.toString());
      }
    });

    it("should return no orders for unknown user ID", async () => {
      const res = await request(app)
        .get("/api/admin/orders?user=000000000000000000000000")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(0);
    });

    it("should return no orders for unknown email", async () => {
      const res = await request(app)
        .get("/api/admin/orders?email=unknown@email.com")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(0);
    });

    it("should return no orders for unknown name", async () => {
      const res = await request(app)
        .get("/api/admin/orders?name=InexistantNom")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(0);
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

    it("should return 400 for invalid status", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID_STATUS" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid|not allowed/i);
    });

    it("should return 403 for non-admin user", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(403);
    });

    it("should persist the new status in the database", async () => {
      await request(app)
        .put(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Delivered" });

      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder.orderStatus).toBe("Delivered");
    });
  });

  describe("EXPORT /api/admin/orders/export", () => {
    it("should export orders as CSV for admin", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/csv")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/csv/);
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
      expect(res.text).toMatch(/ID,Client,Email,Statut,Total/); // En-tête CSV corrigé
    });

    it("should export orders as PDF for admin", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/pdf")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
      expect(res.body.length).toBeGreaterThan(0); // Le PDF n'est pas vide
    });

    it("should not allow non-admin to export CSV", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/csv")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should export only filtered orders as CSV", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/csv?status=Processing")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Processing/);
    });

    it("should export CSV with no orders found", async () => {
      // Vide la collection pour ce test
      await Order.deleteMany({});
      const res = await request(app)
        .get("/api/admin/orders/export/csv?status=NonExistentStatus")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Aucune commande trouvée/);
    });

    it("should export PDF with no orders found", async () => {
      // Vide la collection pour ce test
      await Order.deleteMany({});
      const res = await request(app)
        .get("/api/admin/orders/export/pdf?status=NonExistentStatus")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      // On ne peut pas facilement parser le PDF, mais on vérifie qu'il n'est pas vide
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should export orders as CSV filtered by user", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/export/csv?user=${normalUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(normalUser.email);
    });

    it("should export orders as CSV filtered by email", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/export/csv?email=${normalUser.email}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(normalUser.email);
    });

    it("should export orders as CSV filtered by name", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/csv?name=Normal")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(normalUser.email);
    });

    it("should export CSV with no orders for unknown user", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/csv?user=000000000000000000000000")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Aucune commande trouvée/);
    });

    it("should export orders as PDF filtered by user", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/export/pdf?user=${normalUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should export orders as PDF filtered by email", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/export/pdf?email=${normalUser.email}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should export orders as PDF filtered by name", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/pdf?name=Normal")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should export PDF with no orders for unknown user", async () => {
      const res = await request(app)
        .get("/api/admin/orders/export/pdf?user=000000000000000000000000")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
