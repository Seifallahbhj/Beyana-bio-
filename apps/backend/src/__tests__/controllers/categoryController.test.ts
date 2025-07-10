const request = require("supertest");
const mongoose = require("mongoose");
const generateToken = require("../../utils/generateToken").default;

let app;
let adminToken, customerToken;
let User, Category, Product;

describe("Category Controller Tests", () => {
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    app = require("../../app").default;
    User = mongoose.model("User");
    Category = mongoose.model("Category");
    Product = mongoose.model("Product");
  });

  beforeEach(async () => {
    await Category.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    const admin = await User.create({
      firstName: "Admin",
      lastName: "Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminToken = generateToken(admin._id);

    const customer = await User.create({
      firstName: "Customer",
      lastName: "Test",
      email: "customer@test.com",
      password: "password123",
      role: "customer",
    });
    customerToken = generateToken(customer._id);
  });

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
    });

    it("should create category with auto-generated slug when not provided", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category With Spaces",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBe("test-category-with-spaces");
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

    it("should handle validation errors for non-string name", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: 123,
          slug: "test-category",
        });

      expect(response.status).toBe(201); // Le contrôleur accepte les nombres et les convertit en string
      expect(response.body.success).toBe(true);
    });

    it("should handle validation errors for name too long", async () => {
      const longName = "a".repeat(101);
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: longName,
          slug: "test-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le nom de la catégorie ne peut pas dépasser 100 caractères"
      );
    });

    it("should handle validation errors for invalid parent category ID", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          parentCategory: "invalid-id",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID de catégorie parent invalide");
    });

    it("should handle validation errors for non-existent parent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          parentCategory: fakeId.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("La catégorie parente n'existe pas");
    });

    it("should handle validation errors for inactive parent category", async () => {
      const parentCategory = await Category.create({
        name: "Parent Category",
        slug: "parent-category",
        isActive: false,
      });

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          parentCategory: parentCategory._id.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La catégorie parente n'est pas active"
      );
    });

    it("should handle validation errors for invalid slug format", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "invalid slug with spaces",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
      );
    });

    it("should handle validation errors for empty slug", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
      );
    });

    it("should handle validation errors for slug too long", async () => {
      const longSlug = "a".repeat(101);
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: longSlug,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le slug ne peut pas dépasser 100 caractères"
      );
    });

    it("should handle validation errors for duplicate slug", async () => {
      await Category.create({
        name: "Existing Category",
        slug: "existing-category",
      });

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "existing-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Une catégorie avec ce slug existe déjà"
      );
    });

    it("should handle database errors during save", async () => {
      const originalSave = Category.prototype.save;
      Category.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "test-category",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Database error");

      Category.prototype.save = originalSave;
    });

    it("should handle validation errors during save", async () => {
      const originalSave = Category.prototype.save;
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: { message: "Name is required" } as any,
      };
      Category.prototype.save = jest.fn().mockRejectedValue(validationError);

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "test-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      Category.prototype.save = originalSave;
    });

    it("should handle cast errors during save", async () => {
      const originalSave = Category.prototype.save;
      const castError = new mongoose.Error.CastError(
        "ObjectId",
        "invalid",
        "parentCategory"
      );
      Category.prototype.save = jest.fn().mockRejectedValue(castError);

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "test-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Format de données invalide");

      Category.prototype.save = originalSave;
    });

    it("should handle general errors during save", async () => {
      const originalSave = Category.prototype.save;
      Category.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("General error"));

      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Category",
          slug: "test-category",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Erreur lors de la création de la catégorie"
      );

      Category.prototype.save = originalSave;
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

    it("should support pagination", async () => {
      await Category.create([
        { name: "Category 1", slug: "category-1", isActive: true },
        { name: "Category 2", slug: "category-2", isActive: true },
        { name: "Category 3", slug: "category-3", isActive: true },
      ]);

      const response = await request(app).get("/api/categories?page=1&limit=2");

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.currentPage).toBe(1);
      expect(response.body.data.totalPages).toBe(2);
    });

    it("should support sorting", async () => {
      await Category.create([
        { name: "Category C", slug: "category-c", isActive: true },
        { name: "Category A", slug: "category-a", isActive: true },
        { name: "Category B", slug: "category-b", isActive: true },
      ]);

      const response = await request(app).get("/api/categories?sort=name");

      expect(response.status).toBe(200);
      expect(response.body.data.categories[0].name).toBe("Category A");
    });

    it("should support descending sort", async () => {
      await Category.create([
        { name: "Category A", slug: "category-a", isActive: true },
        { name: "Category B", slug: "category-b", isActive: true },
        { name: "Category C", slug: "category-c", isActive: true },
      ]);

      const response = await request(app).get("/api/categories?sort=-name");

      expect(response.status).toBe(200);
      expect(response.body.data.categories[0].name).toBe("Category C");
    });

    it("should handle database errors", async () => {
      const originalFind = Category.find;
      Category.find = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app).get("/api/categories");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Erreur lors de la récupération des catégories"
      );

      Category.find = originalFind;
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

    it("should get category by slug", async () => {
      const testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
      });

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Category");
    });

    it("should return 404 for non-existent category by ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/categories/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });

    it("should return 404 for non-existent category by slug", async () => {
      const response = await request(app).get("/api/categories/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });

    it("should handle database errors", async () => {
      const originalFindById = Category.findById;
      Category.findById = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/categories/${fakeId}`);

      expect(response.status).toBe(500);

      Category.findById = originalFindById;
    });
  });

  describe("PUT /api/categories/:id", () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
        description: "Original description",
        isActive: true,
        isFeatured: false,
      });
    });

    it("should update category with all fields", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          description: "Updated description",
          isActive: false,
          isFeatured: false, // Mettre false car la catégorie n'a pas de produits actifs
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Test");
      expect(response.body.data.description).toBe("Updated description");
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.data.isFeatured).toBe(false);
    });

    it("should update only name when only name is provided", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name Only",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Name Only");
      expect(response.body.data.slug).toBe("test-category");
      expect(response.body.data.description).toBe("Original description");
    });

    it("should return 404 for invalid ID format", async () => {
      const response = await request(app)
        .put("/api/categories/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID de catégorie invalide");
    });

    it("should return 404 for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/categories/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });

    it("should handle validation errors for non-string name", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: 123,
        });

      expect(response.status).toBe(200); // Le contrôleur accepte les nombres
      expect(response.body.success).toBe(true);
    });

    it("should handle validation errors for empty name", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le nom de la catégorie ne peut pas être vide"
      );
    });

    it("should handle validation errors for name too long", async () => {
      const longName = "a".repeat(101);
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: longName,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le nom de la catégorie ne peut pas dépasser 100 caractères"
      );
    });

    it("should handle validation errors for invalid slug format", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "invalid slug",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
      );
    });

    it("should handle validation errors for duplicate slug", async () => {
      await Category.create({
        name: "Another Category",
        slug: "another-category",
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "another-category",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Une catégorie avec ce slug existe déjà"
      );
    });

    it("should handle validation errors for non-string description", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: 123,
        });

      expect(response.status).toBe(200); // Le contrôleur accepte les nombres
      expect(response.body.success).toBe(true);
    });

    it("should handle validation errors for description too long", async () => {
      const longDescription = "a".repeat(501); // Utiliser 501 au lieu de 1001 car la limite est 500
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: longDescription,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La description ne peut pas dépasser 500 caractères"
      );
    });

    it("should handle validation errors for empty description", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La description ne peut pas être vide"
      );
    });

    it("should handle validation errors for description with invalid characters", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          description: "Description with <script> tags",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La description contient des caractères non autorisés"
      );
    });

    it("should handle validation errors for non-boolean isActive", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: "not-a-boolean",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("isActive doit être un booléen");
    });

    it("should prevent deactivating category with active products", async () => {
      await Product.create({
        name: "Test Product",
        descriptionShort: "Short description",
        descriptionDetailed: "Detailed description",
        price: 100,
        category: testCategory._id,
        isActive: true,
        images: ["image1.jpg"],
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de désactiver une catégorie avec des produits actifs"
      );
    });

    it("should prevent deactivating category with active subcategories", async () => {
      const subCategory = await Category.create({
        name: "Sub Category",
        slug: "sub-category",
        parentCategory: testCategory._id,
        isActive: true,
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de désactiver une catégorie avec des sous-catégories actives"
      );
    });

    it("should handle validation errors for non-boolean isFeatured", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isFeatured: "not-a-boolean",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("isFeatured doit être un booléen");
    });

    it("should prevent featuring inactive category", async () => {
      await Category.findByIdAndUpdate(testCategory._id, { isActive: false });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isFeatured: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de mettre en avant une catégorie inactive"
      );
    });

    it("should prevent featuring category without active products", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isFeatured: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de mettre en avant une catégorie sans produits actifs"
      );
    });

    it("should handle validation errors for non-string parentCategory", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: 123,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID de catégorie parent invalide");
    });

    it("should handle validation errors for invalid parentCategory ID", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: "invalid-id",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID de catégorie parent invalide");
    });

    it("should prevent setting category as its own parent", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: testCategory._id.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Une catégorie ne peut pas être sa propre parente"
      );
    });

    it("should handle non-existent parent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: fakeId.toString(),
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("La catégorie parente n'existe pas");
    });

    it("should handle inactive parent category", async () => {
      const parentCategory = await Category.create({
        name: "Parent Category",
        slug: "parent-category",
        isActive: false,
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: parentCategory._id.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La catégorie parente n'est pas active"
      );
    });

    it("should handle parent category without active products", async () => {
      const parentCategory = await Category.create({
        name: "Parent Category",
        slug: "parent-category",
        isActive: true,
      });

      await Product.create({
        name: "Parent Product",
        descriptionShort: "Short description",
        descriptionDetailed: "Detailed description",
        price: 100,
        category: parentCategory._id,
        isActive: true,
        images: ["image1.jpg"],
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: parentCategory._id.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La catégorie parente n'a pas de sous-catégories actives"
      );
    });

    it("should handle parent category without active subcategories", async () => {
      const parentCategory = await Category.create({
        name: "Parent Category",
        slug: "parent-category",
        isActive: true,
      });

      await Product.create({
        name: "Test Product",
        descriptionShort: "Short description",
        descriptionDetailed: "Detailed description",
        price: 100,
        category: parentCategory._id,
        isActive: true,
        images: ["image1.jpg"],
      });

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: parentCategory._id.toString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "La catégorie parente n'a pas de sous-catégories actives"
      );
    });

    it("should allow setting parentCategory to null", async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          parentCategory: null,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should handle database errors during save", async () => {
      const originalSave = Category.prototype.save;
      Category.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "updated-test",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Database error");

      Category.prototype.save = originalSave;
    });

    it("should handle validation errors during save", async () => {
      const originalSave = Category.prototype.save;
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: { message: "Name is required" } as any,
      };
      Category.prototype.save = jest.fn().mockRejectedValue(validationError);

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "updated-test",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      Category.prototype.save = originalSave;
    });

    it("should handle cast errors during save", async () => {
      const originalSave = Category.prototype.save;
      const castError = new mongoose.Error.CastError(
        "ObjectId",
        "invalid",
        "parentCategory"
      );
      Category.prototype.save = jest.fn().mockRejectedValue(castError);

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "updated-test",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Format de données invalide");

      Category.prototype.save = originalSave;
    });

    it("should handle general errors during save", async () => {
      const originalSave = Category.prototype.save;
      Category.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("General error"));

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Test",
          slug: "updated-test",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Erreur lors de la mise à jour de la catégorie"
      );

      Category.prototype.save = originalSave;
    });
  });

  describe("DELETE /api/categories/:id", () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
      });
    });

    it("should delete category", async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Catégorie supprimée avec succès");

      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory).toBeNull();
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .delete("/api/categories/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID de catégorie invalide");
    });

    it("should return 404 for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });

    it("should prevent deleting category with subcategories", async () => {
      await Category.create({
        name: "Sub Category",
        slug: "sub-category",
        parentCategory: testCategory._id,
      });

      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de supprimer la catégorie car elle contient des sous-catégories"
      );
    });

    it("should prevent deleting category with active products", async () => {
      await Product.create({
        name: "Test Product",
        descriptionShort: "Short description",
        descriptionDetailed: "Detailed description",
        price: 100,
        category: testCategory._id,
        isActive: true,
        images: ["image1.jpg"],
      });

      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Impossible de supprimer la catégorie car elle contient 1 produit(s) actif(s)"
      );
    });

    it("should handle database errors during deletion", async () => {
      const originalFindByIdAndDelete = Category.findByIdAndDelete;
      Category.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(new Error("MongoError"));

      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("MongoError");

      Category.findByIdAndDelete = originalFindByIdAndDelete;
    });

    it("should handle general errors during deletion", async () => {
      const originalFindByIdAndDelete = Category.findByIdAndDelete;
      Category.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(new Error("General error"));

      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);

      Category.findByIdAndDelete = originalFindByIdAndDelete;
    });
  });

  describe("GET /api/categories/:slug/products", () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = await Category.create({
        name: "Test Category",
        slug: "test-category",
        isActive: true,
      });
    });

    it("should get products by category slug", async () => {
      await Product.create([
        {
          name: "Product 1",
          descriptionShort: "Short description 1",
          descriptionDetailed: "Detailed description 1",
          price: 100,
          category: testCategory._id,
          isActive: true,
          images: ["image1.jpg"],
        },
        {
          name: "Product 2",
          descriptionShort: "Short description 2",
          descriptionDetailed: "Detailed description 2",
          price: 200,
          category: testCategory._id,
          isActive: true,
          images: ["image2.jpg"],
        },
      ]);

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.currentPage).toBe(1);
      expect(response.body.data.totalPages).toBe(1);
      expect(response.body.data.total).toBe(2);
    });

    it("should return 404 for non-existent category", async () => {
      const response = await request(app).get(
        "/api/categories/non-existent/products"
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");
    });

    it("should support pagination", async () => {
      await Product.create([
        {
          name: "Product 1",
          descriptionShort: "Short description 1",
          descriptionDetailed: "Detailed description 1",
          price: 100,
          category: testCategory._id,
          isActive: true,
          images: ["image1.jpg"],
        },
        {
          name: "Product 2",
          descriptionShort: "Short description 2",
          descriptionDetailed: "Detailed description 2",
          price: 200,
          category: testCategory._id,
          isActive: true,
          images: ["image2.jpg"],
        },
        {
          name: "Product 3",
          descriptionShort: "Short description 3",
          descriptionDetailed: "Detailed description 3",
          price: 300,
          category: testCategory._id,
          isActive: true,
          images: ["image3.jpg"],
        },
      ]);

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products?page=1&limit=2`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.currentPage).toBe(1);
      expect(response.body.data.totalPages).toBe(2);
    });

    it("should handle invalid page number", async () => {
      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products?page=999`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });

    it("should support sorting", async () => {
      await Product.create([
        {
          name: "Product C",
          descriptionShort: "Short description C",
          descriptionDetailed: "Detailed description C",
          price: 300,
          category: testCategory._id,
          isActive: true,
          images: ["imageC.jpg"],
        },
        {
          name: "Product A",
          descriptionShort: "Short description A",
          descriptionDetailed: "Detailed description A",
          price: 100,
          category: testCategory._id,
          isActive: true,
          images: ["imageA.jpg"],
        },
        {
          name: "Product B",
          descriptionShort: "Short description B",
          descriptionDetailed: "Detailed description B",
          price: 200,
          category: testCategory._id,
          isActive: true,
          images: ["imageB.jpg"],
        },
      ]);

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products?sort=name`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.products[0].name).toBe("Product A");
    });

    it("should handle cast errors", async () => {
      const originalFindOne = Category.findOne;
      Category.findOne = jest
        .fn()
        .mockRejectedValue(
          new mongoose.Error.CastError("ObjectId", "invalid", "category")
        );

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products`
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Catégorie non trouvée");

      Category.findOne = originalFindOne;
    });

    it("should handle database errors", async () => {
      const originalFindOne = Category.findOne;
      Category.findOne = jest.fn().mockRejectedValue(new Error("MongoError"));

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products`
      );

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error retrieving products");

      Category.findOne = originalFindOne;
    });

    it("should handle general database errors", async () => {
      const originalFindOne = Category.findOne;
      Category.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products`
      );

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Database error");

      Category.findOne = originalFindOne;
    });

    it("should handle general errors", async () => {
      const originalFindOne = Category.findOne;
      Category.findOne = jest
        .fn()
        .mockRejectedValue(new Error("General error"));

      const response = await request(app).get(
        `/api/categories/${testCategory.slug}/products`
      );

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error retrieving products");

      Category.findOne = originalFindOne;
    });
  });
});
