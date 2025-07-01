const mongoose = require("mongoose");

// Définition des schémas
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: false, unique: true, lowercase: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    ancestors: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        name: { type: String, required: true },
        slug: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    descriptionShort: { type: String, required: true },
    descriptionDetailed: { type: String, required: true },
    price: { type: Number, required: true },
    promotionalPrice: { type: Number },
    images: { type: [String], required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String },
    sku: { type: String, unique: true, sparse: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    certifications: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    origin: { type: String },
    weight: { type: Number },
    weightUnit: { type: String, default: "g" },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    attributes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
const Product = mongoose.model("Product", ProductSchema);

async function testProductFiltering() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/beyanabio");
    console.log("✅ Connexion réussie à MongoDB\n");

    console.log("🧪 Test du filtrage des produits par catégorie...\n");

    // Test 1: Vérifier les catégories
    console.log("📋 Test 1: Vérification des catégories");
    const categories = await Category.find({}, { name: 1, slug: 1, _id: 1 });
    console.log(`✅ ${categories.length} catégories trouvées`);
    categories.forEach(cat => {
      console.log(`   - "${cat.name}" → "${cat.slug}" (ID: ${cat._id})`);
    });
    console.log();

    // Test 2: Vérifier les produits
    console.log("📦 Test 2: Vérification des produits");
    const products = await Product.find({}, { name: 1, category: 1 }).populate(
      "category",
      "name slug"
    );
    console.log(`✅ ${products.length} produits trouvés`);
    products.forEach(prod => {
      const categoryName = prod.category
        ? prod.category.name
        : "Sans catégorie";
      const categorySlug = prod.category ? prod.category.slug : "N/A";
      console.log(
        `   - "${prod.name}" → catégorie: "${categoryName}" (slug: ${categorySlug})`
      );
    });
    console.log();

    // Test 3: Test de filtrage par slug de catégorie
    console.log("🔍 Test 3: Test de filtrage par slug de catégorie");
    const testSlugs = [
      "cereales-et-grains",
      "miels-et-confitures",
      "epices-et-condiments",
    ];

    for (const slug of testSlugs) {
      console.log(`\n🔎 Test avec le slug: "${slug}"`);

      // Méthode 1: Chercher d'abord la catégorie par slug, puis les produits
      const category = await Category.findOne({ slug: slug });
      if (category) {
        console.log(
          `   ✅ Catégorie trouvée: "${category.name}" (ID: ${category._id})`
        );

        const productsInCategory = await Product.find({
          category: category._id,
        });
        console.log(
          `   📦 ${productsInCategory.length} produit(s) dans cette catégorie`
        );
        productsInCategory.forEach(prod => {
          console.log(`      - "${prod.name}"`);
        });
      } else {
        console.log(`   ❌ Aucune catégorie trouvée avec le slug "${slug}"`);
      }
    }

    // Test 4: Test de la requête qui échoue
    console.log("\n🔍 Test 4: Simulation de la requête qui échoue");
    console.log("   Requête: GET /api/products?category=cereales-et-grains");

    // Simuler exactement ce que fait le contrôleur
    const filter = { category: "cereales-et-grains" };
    const count = await Product.countDocuments(filter);
    console.log(
      `   Résultat: ${count} produit(s) trouvé(s) avec filter:`,
      filter
    );

    if (count === 0) {
      console.log("   ❌ Aucun produit trouvé - c'est le problème !");
      console.log(
        "   💡 Le contrôleur cherche par slug mais les produits sont liés par ObjectId"
      );
    }

    console.log("\n🎉 Tests terminés !");
    console.log(
      "\n💡 Solution: Le contrôleur de produits doit d'abord chercher la catégorie par slug,"
    );
    console.log(
      "   puis chercher les produits par l'ObjectId de la catégorie."
    );
  } catch (error) {
    console.error("❌ Erreur lors des tests :", error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("\n🔌 Déconnexion de MongoDB");
    }
  }
}

// Exécution du script
if (require.main === module) {
  testProductFiltering();
}

module.exports = testProductFiltering;
