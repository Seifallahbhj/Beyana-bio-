const request = require("supertest");
const mongoose = require("mongoose");
const generateToken = require("../../utils/generateToken").default;

// Importer l'application après la configuration Jest
let app;

describe("Category Controller Tests", () => {
  let adminToken;
  let User, Category, Product;

  beforeAll(async () => {
    // Attendre que la connexion MongoDB soit établie
    await new Promise(resolve => setTimeout(resolve, 100));

    // Importer l'application après la configuration
    app = require("../../app").default;

    // Importer les modèles après la connexion
    User = mongoose.model("User");
    Category = mongoose.model("Category");
    Product = mongoose.model("Product");
  });

  beforeEach(async () => {
    // Nettoyer la base de données
    await Category.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // Créer un admin
    const admin = await User.create({
      firstName: "Admin",
      lastName: "Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(admin._id);
  });

  // Nettoyage final après tous les tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/categories", () => {
    it("should create a new category when admin is authenticated", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "test-category",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Category");
      expect(response.body.data.slug).toBe("test-category");

      const testCategory = await Category.findOne({ slug: "test-category" });
      expect(testCategory).toBeTruthy();
      expect(testCategory.name).toBe("Test Category");
    });

    it("should handle validation errors for empty name", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
          slug: "test-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le nom de la catégorie ne peut pas être vide"
      );
    });
  });

  describe("GET /api/categories", () => {
    it("should get all active categories", async () => {
      await Category.create([
        { name: "Category 1", slug: "category-1", isActive: true },
        { name: "Category 2", slug: "category-2", isActive: true },
        { name: "Category 3", slug: "category-3", isActive: false },
      ]);
      const response = await request(app).get("/api/categories");

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toHaveLength(2);
    });
  });

  describe("GET /api/categories/:idOrSlug", () => {
    it("should get category by ID", async () => {
      const testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
      });

      const response = await request(app).get(
        `/api/categories/${testCategory._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Category");
      expect(response.body.data.slug).toBe("test-category");
    });

    it("should return 404 for non-existent category", async () => {
      const response = await request(app).get("/api/categories/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });
  });

  describe("PUT /api/categories/:id", () => {
    it("should update category with all fields", async () => {
      const testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "updated-test",
          description: "Updated description",
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Test");
      expect(response.body.data.slug).toBe("updated-test");
      expect(response.body.data.description).toBe("Updated description");
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete category", async () => {
      const testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
      });

      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Catégorie supprimée avec succès");

      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory).toBeNull();
    });
  });
});
