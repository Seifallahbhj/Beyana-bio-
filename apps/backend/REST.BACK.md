# Feuille de Route Backend - Projet BEYANA

Ce document détaille les tâches restantes pour finaliser le backend de l'application. Le travail déjà effectué (API CRUD pour User, Product, Category, Order, Review, authentification, seeding, upload d'images, tests automatisés, intégration Stripe) a posé des bases solides. Les étapes suivantes visent à enrichir les fonctionnalités, à sécuriser l'application et à la préparer pour la production.

---

## 1. Résumé d'Avancement

- **API CRUD** : User, Product, Category, Order, Review (✅ TERMINÉ)
- **Authentification & Autorisation** : JWT, middlewares protect/admin (✅ TERMINÉ)
- **Paiement** : Stripe (intentions, webhooks, statuts de commande) (✅ TERMINÉ)
- **Upload d'images** : Multer + Cloudinary, optimisation WebP (✅ TERMINÉ)
- **Seeder** : Données de test réalistes, unicité des slugs (✅ TERMINÉ)
- **Validation & Sécurité** : Gestion des erreurs TypeScript, validation des types (✅ EN PLACE)
- **Qualité du Code** : Tous les avertissements ESLint corrigés, code propre et maintenable (✅ TERMINÉ)
- **Tests automatisés** :
  - **Outils** : Jest, Supertest
  - **Nombre de tests** : 53 tests
  - **Couverture** : Contrôleurs, middlewares, webhooks Stripe, cas nominaux et d'erreur
  - **Lancer les tests** : `npm test` dans `/backend`
- **Route API Featured** : `/api/products/featured` (✅ AJOUTÉE ET **INTÉGRÉE AU FRONTEND AVEC SUCCÈS**)

---

## 2. Priorités Immédiates Backend

### **Axe 1 : Recherche, Filtrage et Pagination** 🔄

**Objectif :** Améliorer la découverte des produits et l'intelligence de l'API.

1. **Recherche, Filtrage et Pagination :**
   - ✅ **Route de base** : `GET /api/products` fonctionnelle
   - 🔄 **Améliorer la route** `GET /api/products` pour accepter des paramètres de requête :
     - **Recherche :** `?keyword=...` (recherche sur le nom, la description, la catégorie)
     - **Filtrage :** `?category=...`, `?brand=...`, `?price[gte]=...`, `?price[lte]=...`, `?attributes=bio,vegan`
     - **Tri :** `?sort=-createdAt` (plus récents), `?sort=price` (prix ascendant), `?sort=-price` (prix descendant)
     - **Pagination :** `?page=...` & `?limit=...`

### **Axe 2 : API pour le Tableau de Bord Administrateur** 🔄

**Objectif :** Fournir des données pour le dashboard admin.

1. **Routes protégées (`admin` middleware) :**
   - `GET /api/admin/stats` : Nombre total d'utilisateurs, de commandes, chiffre d'affaires total, etc.
   - `GET /api/admin/orders` : Lister toutes les commandes avec des filtres (par statut, par date)
   - `PUT /api/admin/orders/:id` : Mettre à jour le statut d'une commande (ex: `shipped`, `delivered`)

### **Axe 3 : Qualité, Sécurité et Production** 🔄

**Objectif :** Assurer la robustesse, la sécurité et la maintenabilité du code.

1. **Tests Automatisés :**

   - ✅ **Framework de test** : Jest avec Supertest (en place)
   - ✅ **Tests unitaires** : Fonctions critiques (generateToken, méthodes des modèles)
   - ✅ **Tests d'intégration** : Endpoints de l'API (scénarios nominaux et cas d'erreur)
   - 🔄 **Couverture à améliorer** : Atteindre > 80% de couverture

2. **Sécurité et Optimisation :**

   - ✅ **Validation des entrées** : express-validator (en place)
   - 🔄 **Limitation de débit (Rate Limiting)** : Ajouter `express-rate-limit` pour prévenir les attaques par force brute
   - 🔄 **Logs** : Configurer `morgan` pour logger les requêtes HTTP en production
   - ✅ **Variables d'environnement** : Toutes les clés sensibles dans `.env`

3. **Documentation de l'API :**
   - 🔄 **Swagger/OpenAPI** : Générer une documentation claire et interactive de l'API

---

## 3. Roadmap Backend (Synthèse)

| Tâche principale                      | Responsable | Deadline indicative | Dépend de | Statut      |
| ------------------------------------- | ----------- | ------------------- | --------- | ----------- |
| Recherche/filtrage/pagination backend | Backend     | 1-2 semaines        | -         | 🔄 En cours |
| Endpoints admin/statistiques backend  | Backend     | 2-3 semaines        | -         | 🔄 À faire  |
| Sécurité avancée backend              | Backend     | 2-4 semaines        | -         | 🔄 À faire  |
| Caching, monitoring, doc Swagger      | Backend     | 3-5 semaines        | -         | 🔄 À faire  |

---

## 4. Bonnes pratiques Backend

- ✅ **Vérifier la compatibilité** des dépendances (Node, Express, Mongoose, Stripe, etc.)
- ✅ **Synchroniser la documentation** avec l'état réel du code (endpoints, instructions, scripts)
- ✅ **Prioriser la sécurité** et la robustesse (validation, tests, monitoring)
- ✅ **Utiliser des scripts** de test et de seed à jour (`npm test`, `npm run seed`)
- ✅ **Documenter chaque étape** importante (README, RAPPORT.md, doc Swagger à venir)

---

## 5. Dépendances et Compatibilité

- **Node.js** : version recommandée ≥ 18.x
- **Express.js** : v5.x ou supérieure
- **Mongoose** : v8.x ou supérieure
- **Stripe** : version compatible avec l'API Stripe utilisée
- **Multer, Cloudinary** : pour l'upload d'images
- **Jest, Supertest** : pour les tests automatisés
- **express-validator** : pour la validation avancée (✅ en place)
- **express-rate-limit** : pour la limitation de débit (🔄 à ajouter)
- **Redis** : pour le caching (🔄 à ajouter)
- **morgan** : pour les logs HTTP (🔄 à configurer)
- **Swagger/OpenAPI** : pour la documentation API (🔄 à générer)

---

## 6. Références Utiles

- **Lancer les tests** : `cd backend && npm test`
- **Seeder la base** : `cd backend && npm run seed`
- **Démarrer le serveur** : `cd backend && npm run dev`
- **Variables d'environnement** : voir `.env` ou documentation projet
- **Documentation technique** : voir RAPPORT.md

---

## 7. État Actuel des Endpoints

### **Endpoints Fonctionnels** ✅

- `GET /api/products` - Liste des produits
- `GET /api/products/featured` - Produits en vedette
- `GET /api/products/:id` - Détail d'un produit
- `GET /api/categories` - Liste des catégories
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/orders` - Créer une commande
- `POST /api/stripe/create-payment-intent` - Créer intention de paiement
- `POST /api/upload` - Upload d'images

### **Endpoints à Développer** 🔄

- `GET /api/products` avec filtres avancés
- `GET /api/admin/stats` - Statistiques admin
- `GET /api/admin/orders` - Commandes admin
- `PUT /api/admin/orders/:id` - Mise à jour statut commande

---

**Dernière mise à jour :** Décembre 2024  
**Prochaine révision :** Janvier 2025  
**Responsable :** Équipe Backend BEYANA
