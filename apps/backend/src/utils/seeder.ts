/* eslint-disable no-console */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "../models/User.model";
import Product, { IProduct } from "../models/Product.model";
import Category, { ICategory } from "../models/Category.model";
import { products, categories } from "../data/products"; // Importer les données

// Charger les variables d'environnement
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env file");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected for Seeding...");
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
};

// Export individual functions for testing
export const seedUsers = async (): Promise<IUser[]> => {
  const usersToCreate = [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@beyana.com",
      password: "Welcome0509",
      role: "admin",
    },
    {
      firstName: "Customer",
      lastName: "User",
      email: "customer@beyana.com",
      password: "password123",
      role: "customer",
    },
  ];

  const createdUsers: IUser[] = [];

  for (const userData of usersToCreate) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const user = await User.create(userData);
      createdUsers.push(user);
    } else {
      createdUsers.push(existingUser);
    }
  }

  return createdUsers;
};

export const seedCategories = async (): Promise<ICategory[]> => {
  const createdCategories: ICategory[] = [];

  for (const categoryData of categories) {
    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (!existingCategory) {
      const category = await Category.create(categoryData);
      createdCategories.push(category);
    } else {
      createdCategories.push(existingCategory);
    }
  }

  return createdCategories;
};

export const seedProducts = async (): Promise<IProduct[]> => {
  const existingCategories = await Category.find({});
  const existingUsers = await User.find({});

  if (existingCategories.length === 0) {
    throw new Error("Categories must be seeded before products");
  }

  if (existingUsers.length === 0) {
    throw new Error("Users must be seeded before products");
  }

  const categoryMap = existingCategories.reduce(
    (acc, category) => {
      acc[category.name] = category._id as mongoose.Types.ObjectId;
      return acc;
    },
    {} as Record<string, mongoose.Types.ObjectId>
  );

  const productsToCreate = products.map(product => ({
    ...product,
    category: categoryMap[product.category],
    user: existingUsers[0]._id, // Associer à l'admin
  }));

  const createdProducts: IProduct[] = [];

  for (const productData of productsToCreate) {
    // Check if product already exists
    const existingProduct = await Product.findOne({ name: productData.name });
    if (!existingProduct) {
      const product = await Product.create(productData);
      createdProducts.push(product);
    } else {
      createdProducts.push(existingProduct);
    }
  }

  return createdProducts;
};

export const runAll = async () => {
  await seedUsers();
  await seedCategories();
  await seedProducts();
};

export const clearAll = async () => {
  await Product.deleteMany();
  await Category.deleteMany();
  await User.deleteMany();
};

const importData = async () => {
  try {
    // 1. Nettoyer la base de données
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log("Database cleared.");

    // 2. Créer les utilisateurs
    // Utiliser User.create() individuellement pour chaque utilisateur
    // afin de s'assurer que le hook pre-save pour le hachage du mot de passe est déclenché.
    const usersToCreate = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@beyana.com",
        password: "Welcome0509",
        role: "admin",
      },
      {
        firstName: "Customer",
        lastName: "User",
        email: "customer@beyana.com",
        password: "password123",
        role: "customer",
      },
    ];

    const createdUsers: IUser[] = [];

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        createdUsers.push(user);
      } else {
        createdUsers.push(existingUser);
      }
    }

    console.log("Users imported.");

    // 3. Créer les catégories (en utilisant create pour déclencher les hooks)
    console.log("Importing categories...");
    // Nous utilisons Promise.all avec map pour créer chaque catégorie individuellement,
    // ce qui garantit que le middleware 'pre-save' (pour le slug) est exécuté.
    const createdCategories: ICategory[] = [];

    for (const categoryData of categories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({
        name: categoryData.name,
      });
      if (!existingCategory) {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
      } else {
        createdCategories.push(existingCategory);
      }
    }
    console.log("Categories imported.");

    // 4. Mapper les noms de catégorie à leurs IDs
    const categoryMap = createdCategories.reduce(
      (acc, category) => {
        acc[category.name] = category._id as mongoose.Types.ObjectId;
        return acc;
      },
      {} as Record<string, mongoose.Types.ObjectId>
    );

    // 5. Préparer les produits avec les bons IDs de catégorie
    const productsToCreate = products.map(product => ({
      ...product,
      category: categoryMap[product.category],
      user: createdUsers[0]._id, // Associer à l'admin
    }));

    // 6. Insérer les produits (en utilisant create pour déclencher les hooks)
    console.log("Importing products...");
    for (const productData of productsToCreate) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        await Product.create(productData);
      }
    }
    console.log("Products imported.");

    console.log("Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(
      `Error during data import: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    // console.log("Data Destroyed!");
    process.exit();
  } catch {
    // console.error(`Error during data destruction: ${(error as Error).message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  if (process.argv[2] === "-d") {
    await destroyData();
  } else {
    await importData();
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  run();
}
