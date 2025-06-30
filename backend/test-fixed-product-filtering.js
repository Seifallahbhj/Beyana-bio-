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

// Fonction qui simule la logique corrigée du contrôleur
async function simulateFixedProductFiltering(categoryParam) {
  const filter = {};

  // Vérifier si c'est un ObjectId valide
  if (categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
    // C'est un ObjectId, utiliser directement
    filter.category = categoryParam;
    console.log(
      `   ✅ ObjectId détecté, utilisation directe: ${categoryParam}`
    );
  } else {
    // C'est probablement un slug, chercher la catégorie d'abord
    console.log(
      `   🔍 Slug détecté, recherche de la catégorie: ${categoryParam}`
    );
    try {
      const category = await Category.findOne({ slug: categoryParam });
      if (category) {
        filter.category = category._id;
        console.log(
          `   ✅ Catégorie trouvée: "${category.name}" (ID: ${category._id})`
        );
      } else {
        console.log(
          `   ❌ Aucune catégorie trouvée avec le slug "${categoryParam}"`
        );
        return { success: false, products: [] };
      }
    } catch (error) {
      console.log(`   ❌ Erreur lors de la recherche: ${error.message}`);
      return { success: false, products: [] };
    }
  }

  // Chercher les produits avec le filtre
  const products = await Product.find(filter).populate("category", "name slug");
  return { success: true, products };
}

async function testFixedProductFiltering() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/beyanabio");
    console.log("✅ Connexion réussie à MongoDB\n");

    console.log("🧪 Test de la logique corrigée du filtrage des produits...\n");

    // Test avec différents types de paramètres
    const testCases = [
      "cereales-et-grains", // Slug valide
      "miels-et-confitures", // Slug valide
      "epices-et-condiments", // Slug valide
      "categorie-inexistante", // Slug inexistant
      "68574b0b1b4f14c8050b588f", // ObjectId valide
      "invalid-objectid", // ObjectId invalide
    ];

    for (const testCase of testCases) {
      console.log(`🔍 Test avec: "${testCase}"`);

      const result = await simulateFixedProductFiltering(testCase);

      if (result.success) {
        console.log(`   📦 ${result.products.length} produit(s) trouvé(s)`);
        result.products.forEach((prod) => {
          const categoryName = prod.category
            ? prod.category.name
            : "Sans catégorie";
          console.log(`      - "${prod.name}" → "${categoryName}"`);
        });
      } else {
        console.log(`   ❌ Aucun produit trouvé`);
      }
      console.log();
    }

    console.log("🎉 Tests terminés !");
    console.log(
      "\n💡 Si tous les tests passent, le contrôleur corrigé devrait fonctionner."
    );
    console.log("   Redémarre le backend pour appliquer les changements.");
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
  testFixedProductFiltering();
}

module.exports = testFixedProductFiltering;
