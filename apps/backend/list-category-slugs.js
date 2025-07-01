const mongoose = require("mongoose");

// Configuration MongoDB - utiliser la base qui contient les données
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/beyanabio";

// Définition du schéma Category directement dans le script pour éviter les problèmes d'import
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

// Créer le modèle Category
const Category = mongoose.model("Category", CategorySchema);

async function listCategorySlugs() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    console.log(`📍 URI utilisée : ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connexion réussie à MongoDB\n");

    // Vérifier les bases de données disponibles
    console.log("🔍 Vérification des bases de données...");
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    console.log("📋 Bases de données disponibles :");
    dbList.databases.forEach(db => {
      console.log(`   - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    console.log();

    // Vérifier la base de données actuelle
    const currentDb = mongoose.connection.db.databaseName;
    console.log(`🎯 Base de données actuelle : ${currentDb}`);

    // Lister toutes les collections
    console.log("📁 Collections dans la base actuelle :");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    if (collections.length === 0) {
      console.log("   ❌ Aucune collection trouvée");
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }
    console.log();

    // Examiner directement la collection 'categories'
    console.log("🔍 Examen direct de la collection 'categories'...");
    const categoriesCollection =
      mongoose.connection.db.collection("categories");
    const categoriesCount = await categoriesCollection.countDocuments();
    console.log(
      `📊 Nombre de documents dans 'categories' : ${categoriesCount}`
    );

    if (categoriesCount > 0) {
      console.log("\n📄 Documents bruts dans la collection 'categories' :");
      const rawCategories = await categoriesCollection
        .find({})
        .limit(10)
        .toArray();
      rawCategories.forEach((doc, index) => {
        console.log(`\n--- Document ${index + 1} ---`);
        console.log(JSON.stringify(doc, null, 2));
      });
    }

    console.log("\n📋 Récupération des catégories via Mongoose...");
    const categories = await Category.find(
      {},
      { name: 1, slug: 1, _id: 1 }
    ).lean();

    if (categories.length === 0) {
      console.log("❌ Aucune catégorie trouvée via Mongoose");
      console.log("\n💡 Suggestions :");
      console.log("   1. Vérifie que tu utilises la bonne base de données");
      console.log("   2. Lance le seeder pour créer des données de test");
      console.log(
        "   3. Vérifie que les catégories existent dans la collection 'categories'"
      );

      // Essayer de chercher dans toutes les collections
      console.log("\n🔍 Recherche dans toutes les collections...");
      for (const collection of collections) {
        try {
          const docs = await mongoose.connection.db
            .collection(collection.name)
            .find({})
            .limit(5)
            .toArray();
          if (docs.length > 0) {
            console.log(
              `   📄 Collection '${collection.name}' contient ${docs.length} document(s)`
            );
            if (docs[0].name) {
              console.log(`   📝 Exemple : ${docs[0].name}`);
            }
          }
        } catch (err) {
          console.log(
            `   ❌ Erreur lecture collection '${collection.name}': ${err.message}`
          );
        }
      }
      return;
    }

    console.log(`✅ ${categories.length} catégorie(s) trouvée(s) :\n`);
    console.log(
      "┌─────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                    CATÉGORIES EN BASE                      │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );

    categories.forEach((cat, index) => {
      const num = (index + 1).toString().padStart(2, "0");
      const name = cat.name.padEnd(25, " ");
      const slug = cat.slug.padEnd(25, " ");
      console.log(`│ ${num}. ${name} │ ${slug} │`);
    });

    console.log(
      "└─────────────────────────────────────────────────────────────┘"
    );

    // Affichage des statistiques
    console.log("\n📊 Statistiques :");
    console.log(`- Total des catégories : ${categories.length}`);

    const slugsWithSpaces = categories.filter(
      cat => cat.slug && cat.slug.includes(" ")
    );
    if (slugsWithSpaces.length > 0) {
      console.log(`- Slugs avec espaces : ${slugsWithSpaces.length}`);
      console.log("  ⚠️  Ces slugs peuvent causer des problèmes d'URL :");
      slugsWithSpaces.forEach(cat => {
        console.log(`    • "${cat.name}" → "${cat.slug}"`);
      });
    }

    const slugsWithAccents = categories.filter(
      cat => cat.slug && /[àáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/.test(cat.slug)
    );
    if (slugsWithAccents.length > 0) {
      console.log(`- Slugs avec accents : ${slugsWithAccents.length}`);
      console.log("  ⚠️  Ces slugs peuvent causer des problèmes d'URL :");
      slugsWithAccents.forEach(cat => {
        console.log(`    • "${cat.name}" → "${cat.slug}"`);
      });
    }

    const duplicateSlugs = categories.reduce((acc, cat) => {
      if (cat.slug) {
        acc[cat.slug] = (acc[cat.slug] || 0) + 1;
      }
      return acc;
    }, {});

    const duplicates = Object.entries(duplicateSlugs).filter(
      ([slug, count]) => count > 1
    );
    if (duplicates.length > 0) {
      console.log(`- Slugs en double : ${duplicates.length}`);
      console.log("  ⚠️  Ces slugs en double peuvent causer des conflits :");
      duplicates.forEach(([slug, count]) => {
        const catsWithSlug = categories.filter(cat => cat.slug === slug);
        console.log(`    • "${slug}" (${count} fois) :`);
        catsWithSlug.forEach(cat => {
          console.log(`      - "${cat.name}" (ID: ${cat._id})`);
        });
      });
    }

    // Vérification des slugs manquants
    const categoriesWithoutSlug = categories.filter(cat => !cat.slug);
    if (categoriesWithoutSlug.length > 0) {
      console.log(`- Catégories sans slug : ${categoriesWithoutSlug.length}`);
      console.log("  ⚠️  Ces catégories n'ont pas de slug :");
      categoriesWithoutSlug.forEach(cat => {
        console.log(`    • "${cat.name}" (ID: ${cat._id})`);
      });
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des catégories :",
      error.message
    );
    if (error.name === "MongoNetworkError") {
      console.log("\n💡 Vérifie que :");
      console.log("   - MongoDB est démarré");
      console.log("   - L'URI de connexion est correcte");
      console.log("   - Tu peux modifier l'URI dans le script si nécessaire");
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("\n🔌 Déconnexion de MongoDB");
    }
  }
}

// Exécution du script
if (require.main === module) {
  listCategorySlugs();
}

module.exports = listCategorySlugs;
