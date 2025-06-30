const mongoose = require("mongoose");

// Définition du schéma Category
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
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
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);

// Fonction pour tester la recherche par slug (comme dans le contrôleur)
async function testCategoryController() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/beyanabio");
    console.log("✅ Connexion réussie à MongoDB\n");

    console.log("🧪 Test du contrôleur de catégories...\n");

    // Test 1: Récupérer toutes les catégories
    console.log("📋 Test 1: Récupération de toutes les catégories");
    const allCategories = await Category.find({});
    console.log(`✅ ${allCategories.length} catégories trouvées\n`);

    // Test 2: Recherche par slug (comme dans getCategoryByIdOrSlug)
    const testSlugs = [
      "cereales-et-grains",
      "miels-et-confitures",
      "epices-et-condiments",
      "thes-et-infusions",
      "huiles-et-vinaigres",
    ];

    console.log("🔍 Test 2: Recherche par slug (simulation du contrôleur)");
    for (const slug of testSlugs) {
      console.log(`\n🔎 Recherche du slug: "${slug}"`);

      // Simulation exacte de la logique du contrôleur
      let category;
      if (mongoose.Types.ObjectId.isValid(slug)) {
        category = await Category.findById(slug);
        console.log(`   Méthode: findById (ObjectId valide)`);
      } else {
        category = await Category.findOne({ slug: slug });
        console.log(`   Méthode: findOne({ slug: "${slug}" })`);
      }

      if (category) {
        console.log(`   ✅ TROUVÉ: "${category.name}" (ID: ${category._id})`);
      } else {
        console.log(
          `   ❌ NON TROUVÉ: Aucune catégorie avec le slug "${slug}"`
        );
      }
    }

    // Test 3: Test avec un slug inexistant
    console.log("\n🔍 Test 3: Test avec un slug inexistant");
    const fakeSlug = "categorie-inexistante";
    const fakeCategory = await Category.findOne({ slug: fakeSlug });
    if (!fakeCategory) {
      console.log(`   ✅ CORRECT: Aucune catégorie trouvée pour "${fakeSlug}"`);
    } else {
      console.log(`   ❌ ERREUR: Catégorie trouvée pour "${fakeSlug}"`);
    }

    console.log("\n🎉 Tests terminés !");
    console.log(
      "\n💡 Si tous les tests passent, le contrôleur backend devrait fonctionner correctement."
    );
    console.log(
      "   Les erreurs 404 sur les routes de catégories devraient être résolues."
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
  testCategoryController();
}

module.exports = testCategoryController;
