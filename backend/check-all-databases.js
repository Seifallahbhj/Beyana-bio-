const mongoose = require("mongoose");

async function checkAllDatabases() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/admin");
    console.log("✅ Connexion réussie à MongoDB\n");

    // Lister toutes les bases de données
    const adminDb = mongoose.connection.db.admin();
    const dbList = await adminDb.listDatabases();

    console.log("🔍 Vérification de toutes les bases de données...\n");

    for (const dbInfo of dbList.databases) {
      if (
        dbInfo.name === "admin" ||
        dbInfo.name === "config" ||
        dbInfo.name === "local"
      ) {
        continue; // Ignorer les bases système
      }

      console.log(
        `📊 Base de données : ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`
      );

      try {
        // Se connecter à cette base de données
        const db = mongoose.connection.client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
          console.log("   ❌ Aucune collection");
        } else {
          console.log("   📁 Collections :");
          for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`      - ${collection.name}: ${count} documents`);

            // Si c'est la collection categories et qu'elle a des données
            if (collection.name === "categories" && count > 0) {
              console.log(`      🎯 CATÉGORIES TROUVÉES dans ${dbInfo.name}!`);
              const categories = await db
                .collection("categories")
                .find({})
                .limit(5)
                .toArray();
              categories.forEach((cat, index) => {
                console.log(
                  `         ${index + 1}. ${cat.name || "Sans nom"} → ${
                    cat.slug || "Sans slug"
                  }`
                );
              });
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }

      console.log();
    }
  } catch (error) {
    console.error("❌ Erreur :", error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("🔌 Déconnexion de MongoDB");
    }
  }
}

// Exécution du script
if (require.main === module) {
  checkAllDatabases();
}

module.exports = checkAllDatabases;
