const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app").default;
const generateToken = require("../../utils/generateToken").default;

describe("Product Controller", () => {
  jest.setTimeout(60000);

  let adminToken;
  let adminUser;
  let testCategory;
  let testProduct;
  let User, Product, Category;

  beforeAll(async () => {
    // Attendre que la connexion MongoDB soit établie
    await new Promise(resolve => setTimeout(resolve, 100));

    // Importer les modèles après la connexion
    User = mongoose.model("User");
    Product = mongoose.model("Product");
    Category = mongoose.model("Category");
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Créer un utilisateur admin pour chaque test
    adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: "Test Category",
      slug: "test-category",
    });

    // Créer un produit de test
    testProduct = await Product.create({
      name: "Test Product",
      descriptionShort: "A short description",
      descriptionDetailed: "A detailed description",
      price: 99.99,
      category: testCategory._id,
      brand: "Test Brand",
      stockQuantity: 10,
      images: ["https://example.com/test-image.jpg"],
      attributes: ["bio", "vegan"],
    });

    // Générer les tokens
    adminToken = generateToken(adminUser._id);
  });

  describe("GET /api/products", () => {
    it("should get all products with default pagination", async () => {
      const response = await request(app).get("/api/products").expect(200);

      expect(response.body.data).toHaveProperty("products");
      expect(response.body.data).toHaveProperty("page", 1);
      expect(response.body.data).toHaveProperty("pages");
      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("facets");
    });

    it("should filter products by keyword", async () => {
      const response = await request(app)
        .get("/api/products?keyword=Test")
        .expect(200);

      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.products[0].name).toContain("Test");
    });

    it("should filter products by category", async () => {
      const response = await request(app)
        .get(`/api/products?category=${testCategory._id}`)
        .expect(200);

      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.products[0].category._id).toBe(
        testCategory._id.toString()
      );
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get product by id", async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.data).toHaveProperty(
        "_id",
        testProduct._id.toString()
      );
      expect(response.body.data).toHaveProperty("name", testProduct.name);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Produit non trouvé");
    });
  });

  describe("POST /api/products", () => {
    const newProduct = {
      name: "New Product",
      descriptionShort: "A new product",
      descriptionDetailed: "A detailed description",
      price: 149.99,
      category: "",
      brand: "New Brand",
      stockQuantity: 20,
      images: ["https://example.com/new-image.jpg"],
      attributes: ["bio"],
    };

    it("should create product when admin", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...newProduct, category: testCategory._id })
        .expect(201);

      expect(response.body).toHaveProperty("name", newProduct.name);
      expect(response.body).toHaveProperty("price", newProduct.price);
    });

    it("should not create product without authentication", async () => {
      const response = await request(app)
        .post("/api/products")
        .send(newProduct)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Not authorized, no token"
      );
    });
  });

  describe("PUT /api/products/:id", () => {
    const updateData = {
      name: "Updated Product",
      price: 199.99,
    };

    it("should update product when admin", async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("name", updateData.name);
      expect(response.body).toHaveProperty("price", updateData.price);
    });

    it("should not update product without authentication", async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Not authorized, no token"
      );
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete product when admin", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Product removed");

      // Vérifier que le produit a bien été supprimé
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it("should not delete product without authentication", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Not authorized, no token"
      );
    });
  });
});
