import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import Product from "../../models/Product.model";
import Category from "../../models/Category.model";
import generateToken from "../../utils/generateToken";
import User, { IUser } from "../../models/User.model";
import { IProduct } from "../../models/Product.model";
import { ICategory } from "../../models/Category.model";

describe("Product Controller", () => {
  jest.setTimeout(60000);
  let adminToken: string;
  let userToken: string;
  let adminUser: IUser;
  let normalUser: IUser;
  let testCategory: ICategory;
  let testProduct: IProduct & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Créer un utilisateur admin pour chaque test
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });

    // Créer un utilisateur normal pour chaque test
    normalUser = await User.create({
      name: "Normal User",
      email: "user@test.com",
      password: "password123",
      role: "customer",
      firstName: "Normal",
      lastName: "User",
    });

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: "Test Category",
      slug: "test-category",
    });

    // Créer un produit de test
    testProduct = (await Product.create({
      name: "Test Product",
      descriptionShort: "A short description",
      descriptionDetailed: "A detailed description",
      price: 99.99,
      category: testCategory._id,
      brand: "Test Brand",
      stockQuantity: 10,
      images: ["https://example.com/test-image.jpg"],
      attributes: ["bio", "vegan"],
    })) as IProduct & { _id: mongoose.Types.ObjectId };

    // Générer les tokens
    adminToken = generateToken(adminUser._id);
    userToken = generateToken(normalUser._id);
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
        (testCategory._id as mongoose.Types.ObjectId).toString()
      );
    });

    it("should filter products by price range", async () => {
      const response = await request(app)
        .get("/api/products?minPrice=50&maxPrice=100")
        .expect(200);

      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.products[0].price).toBeGreaterThanOrEqual(50);
      expect(response.body.data.products[0].price).toBeLessThanOrEqual(100);
    });

    it("should filter products by attributes", async () => {
      // Nettoyage de la base de données avant le test
      await Product.deleteMany({});

      // Création des produits de test
      const [product1, product2] = await Promise.all([
        Product.create({
          name: "Special Bio Vegan Product",
          slug: "special-bio-vegan-product",
          descriptionShort: "A special bio and vegan product",
          descriptionDetailed:
            "A detailed description of our special bio and vegan product",
          price: 29.99,
          category: testCategory._id,
          brand: "Test Brand",
          stockQuantity: 10,
          images: ["https://example.com/test-image.jpg"],
          attributes: ["bio", "vegan"],
        }),
        Product.create({
          name: "Regular Product",
          slug: "regular-product",
          descriptionShort: "A regular product",
          descriptionDetailed: "A detailed description of our regular product",
          price: 19.99,
          category: testCategory._id,
          brand: "Test Brand",
          stockQuantity: 5,
          images: ["https://example.com/test-image.jpg"],
          attributes: ["bio"],
        }),
      ]);

      console.log("Created products:", [
        { name: product1.name, attributes: product1.attributes },
        { name: product2.name, attributes: product2.attributes },
      ]);

      // Test du filtrage par attributs
      const response = await request(app)
        .get("/api/products?attributes=bio,vegan")
        .expect(200);

      console.log(
        "Response products:",
        response.body.data.products.map((p: IProduct) => ({
          name: p.name,
          attributes: p.attributes,
        }))
      );

      // Les assertions
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].name).toBe(
        "Special Bio Vegan Product"
      );
      expect(response.body.data.products[0].attributes).toContain("bio");
      expect(response.body.data.products[0].attributes).toContain("vegan");
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

  describe("GET /api/products/slug/:slug", () => {
    it("should get product by slug", async () => {
      const response = await request(app)
        .get(`/api/products/slug/${testProduct.slug}`)
        .expect(200);

      expect(response.body.data).toHaveProperty(
        "_id",
        testProduct._id.toString()
      );
      expect(response.body.data).toHaveProperty("slug", testProduct.slug);
    });

    it("should return 404 for non-existent slug", async () => {
      const response = await request(app)
        .get("/api/products/slug/non-existent-slug")
        .expect(404);

      expect(response.body).toHaveProperty("message", "Product not found");
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

    it("should not create product with non-admin user", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newProduct)
        .expect(403);

      expect(response.body).toHaveProperty(
        "message",
        "Not authorized as an admin"
      );
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("message");
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

    it("should not update non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Product not found");
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

    it("should not delete non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Product not found");
    });
  });
});
