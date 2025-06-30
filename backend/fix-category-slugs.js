const mongoose = require("mongoose");
const path = require("path");

// Fonction slugify améliorée pour gérer les accents français
function slugify(str) {
  return str
    .normalize("NFD") // Normalise les caractères Unicode
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/&/g, "et") // Remplace & par "et"
    .replace(/[^\w\s-]/g, "") // Supprime les caractères spéciaux sauf espaces et tirets
    .trim()
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/-+/g, "-") // Remplace les tirets multiples par un seul
    .toLowerCase();
}

// Définition du schéma Category pour éviter les problèmes d'import
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

async function fixSlugs() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/beyanabio"); // Utiliser la bonne base
    console.log("✅ Connexion réussie à MongoDB\n");

    console.log("📋 Récupération des catégories...");
    const categories = await Category.find();
    console.log(`✅ ${categories.length} catégorie(s) trouvée(s)\n`);

    console.log("🔧 Correction des slugs...");
    let updatedCount = 0;

    for (const cat of categories) {
      const newSlug = slugify(cat.name);
      if (cat.slug !== newSlug) {
        console.log(`📝 "${cat.name}"`);
        console.log(`   Ancien slug: "${cat.slug}"`);
        console.log(`   Nouveau slug: "${newSlug}"`);

        cat.slug = newSlug;
        await cat.save();
        updatedCount++;
        console.log(`   ✅ Mis à jour\n`);
      } else {
        console.log(`✅ "${cat.name}" → "${cat.slug}" (déjà correct)\n`);
      }
    }

    console.log(`🎉 Migration terminée ! ${updatedCount} slug(s) mis à jour.`);
  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("🔌 Déconnexion de MongoDB");
    }
  }
}

// Exécution du script
if (require.main === module) {
  fixSlugs();
}

module.exports = fixSlugs;
