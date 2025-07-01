import request from "supertest";
import express, { Application, ErrorRequestHandler } from "express";
import app from "../../app";
import User from "../../models/User.model";
import { errorHandler, notFound } from "../../middleware/errorMiddleware";

describe("Error Middleware", () => {
  let testApp: Application;

  beforeAll(() => {
    // Créer une instance dédiée d'Express pour les tests d'erreur serveur
    testApp = express();
    testApp.use(express.json());

    // Ajouter une route de test qui génère une erreur
    testApp.get("/error", (req, res, next) => {
      next(new Error("Test error"));
    });

    // Ajouter les middlewares d'erreur avec le bon typage
    testApp.use(notFound);
    testApp.use(errorHandler as ErrorRequestHandler);
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
  });

  describe("404 Not Found", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(testApp)
        .get("/api/non-existent-route")
        .expect(404);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Not Found - /api/non-existent-route");
    });
  });

  describe("Validation Errors", () => {
    it("should handle mongoose validation errors", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          email: "invalid-email",
          password: "123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("firstName");
    });
  });

  describe("Cast Errors", () => {
    it("should handle invalid MongoDB ObjectId", async () => {
      const response = await request(app)
        .get("/api/products/invalid-id")
        .expect(404);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Resource not found or invalid ID");
    });
  });

  describe("Duplicate Key Errors", () => {
    it("should handle duplicate email registration", async () => {
      // Créer d'abord un utilisateur
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "password123",
      });

      // Tenter de créer un utilisateur avec le même email
      const response = await request(app)
        .post("/api/users/register")
        .send({
          firstName: "Jane",
          lastName: "Doe",
          email: "test@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("User already exists");
    });
  });

  describe("JWT Errors", () => {
    it("should handle invalid JWT token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Not authorized, token failed");
    });
  });

  describe("Server Errors", () => {
    it("should handle unexpected errors", async () => {
      const response = await request(testApp).get("/error").expect(500);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Test error");
    });
  });
});
