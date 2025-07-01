import request from "supertest";
import app from "../../app";
import User from "../../models/User.model";
import generateToken from "../../utils/generateToken";
import { IUser } from "../../models/User.model";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("Auth Middleware", () => {
  let adminToken: string;
  let customerToken: string;
  let adminUser: IUser & { _id: mongoose.Types.ObjectId };
  let customerUser: IUser & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    // Nettoyer la base de données
    await User.deleteMany({});

    // Créer un utilisateur admin
    adminUser = (await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    })) as IUser & { _id: mongoose.Types.ObjectId };
    adminToken = generateToken(adminUser._id);

    // Créer un utilisateur client
    customerUser = (await User.create({
      name: "Customer User",
      email: "customer@test.com",
      password: "password123",
      role: "customer",
      firstName: "Customer",
      lastName: "User",
    })) as IUser & { _id: mongoose.Types.ObjectId };
    customerToken = generateToken(customerUser._id);
  });

  describe("Protected Routes", () => {
    it("should allow access with valid admin token", async () => {
      const response = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should deny access to admin routes with customer token", async () => {
      await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(403);
    });

    it("should deny access with invalid token", async () => {
      await request(app)
        .get("/api/admin/stats")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });

    it("should deny access without token", async () => {
      await request(app).get("/api/admin/stats").expect(401);
    });
  });

  describe("Customer Routes", () => {
    it("should allow access with valid customer token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.email).toBe(customerUser.email);
    });

    it("should allow admin to access customer routes", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe(adminUser.email);
    });
  });

  describe("Token Validation", () => {
    it("should reject expired token", async () => {
      // Créer un token qui expire dans 1 seconde
      const expiredToken = jwt.sign(
        { id: adminUser._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1s" }
      );

      // Attendre que le token expire
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toBe("token expired");
    });

    it("should reject malformed token", async () => {
      await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer malformed.token")
        .expect(401);
    });

    it("should reject token with invalid user ID", async () => {
      const invalidUserIdToken = generateToken(new mongoose.Types.ObjectId());

      await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${invalidUserIdToken}`)
        .expect(401);
    });
  });
});
