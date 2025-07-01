import mongoose from "mongoose";
import Category from "../../models/Category.model";

describe("Category Model Test", () => {
  afterEach(async () => {
    await Category.deleteMany({});
  });

  it("should create & save category successfully", async () => {
    const validCategory = new Category({
      name: "Test Category",
      slug: "test-category",
      description: "Test Description",
      isActive: true,
      isFeatured: false,
    });
    const savedCategory = await validCategory.save();

    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe(validCategory.name);
    expect(savedCategory.slug).toBe(validCategory.slug);
    expect(savedCategory.isActive).toBe(true);
    expect(savedCategory.isFeatured).toBe(false);
  });

  it("should fail to save category without required fields", async () => {
    const categoryWithoutRequiredField = new Category({});
    let err: mongoose.Error.ValidationError | undefined;

    try {
      await categoryWithoutRequiredField.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err?.errors.name).toBeDefined();
  });

  it("should fail to save category with invalid slug format", async () => {
    const categoryWithInvalidSlug = new Category({
      name: "Test Category",
      slug: "invalid@slug",
      description: "Test Description",
    });
    let err: mongoose.Error.ValidationError | undefined;

    try {
      await categoryWithInvalidSlug.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err?.errors.slug).toBeDefined();
  });

  it("should handle duplicate slug by generating unique slug", async () => {
    const category1 = new Category({
      name: "Test Category",
      slug: "test-category",
      description: "Test Description 1",
    });
    await category1.save();

    const category2 = new Category({
      name: "Test Category",
      slug: "test-category", // Même slug
      description: "Test Description 2",
    });
    const savedCategory2 = await category2.save();

    // Le deuxième slug devrait être modifié automatiquement
    expect(savedCategory2.slug).not.toBe("test-category");
    expect(savedCategory2.slug).toMatch(/^test-category-\d+$/);
    expect(category1.slug).toBe("test-category");
  });

  it("should generate slug from name if not provided", async () => {
    const category = new Category({
      name: "Test Category Name",
      description: "Test Description",
    });
    const savedCategory = await category.save();

    expect(savedCategory.slug).toBe("test-category-name");
  });

  it("should handle parent category and ancestors correctly", async () => {
    // Create parent category
    const parentCategory = new Category({
      name: "Parent Category",
      slug: "parent-category",
    });
    const savedParent = await parentCategory.save();

    // Create child category
    const childCategory = new Category({
      name: "Child Category",
      slug: "child-category",
      parentCategory: savedParent._id as mongoose.Types.ObjectId,
    });
    const savedChild = await childCategory.save();

    expect(savedChild.parentCategory).toBeDefined();
    expect(savedChild.ancestors).toHaveLength(1);
    expect(savedChild.ancestors[0]._id.toString()).toBe(
      (savedParent._id as mongoose.Types.ObjectId).toString()
    );
  });

  it("should validate name length", async () => {
    const longName = "a".repeat(101); // 101 characters
    const category = new Category({
      name: longName,
      slug: "test-category",
    });
    let err: mongoose.Error.ValidationError | undefined;

    try {
      await category.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err?.errors.name).toBeDefined();
  });

  it("should validate description length", async () => {
    const longDescription = "a".repeat(501); // 501 characters
    const category = new Category({
      name: "Test Category",
      slug: "test-category",
      description: longDescription,
    });
    let err: mongoose.Error.ValidationError | undefined;

    try {
      await category.save();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err?.errors.description).toBeDefined();
  });

  it("should set default values correctly", async () => {
    const category = new Category({
      name: "Test Category",
      slug: "test-category",
    });
    const savedCategory = await category.save();

    expect(savedCategory.isActive).toBe(true);
    expect(savedCategory.isFeatured).toBe(false);
    expect(savedCategory.ancestors).toHaveLength(0);
  });
});
