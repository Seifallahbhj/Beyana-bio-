# 🚀 API REST Backend BEYANA - Documentation Complète

[![CI/CD Status](https://github.com/Seifallahbhj/Beyana-bio-/actions/workflows/ci.yml/badge.svg)](https://github.com/Seifallahbhj/Beyana-bio-/actions)

---

## 📑 Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Utilisateurs](#utilisateurs)
- [Produits](#produits)
- [Commandes](#commandes)
- [Paiements Stripe](#paiements-stripe)
- [Catégories](#catégories)
- [Avis](#avis)
- [Upload d'images](#upload-dimages)
- [Recherche](#recherche)
- [Statistiques (admin)](#statistiques-admin)
- [Gestion d'erreurs](#gestion-derreurs)
- [Configuration](#configuration)
- [Changelog API](#changelog-api)

---

## 🔗 Liens utiles

- [README](./README.md)
- [Roadmap](./ROADMAP.md)

---

## 🆕 **NOUVELLE ARCHITECTURE MONOREPO (Janvier 2025)**

- **Monorepo Turborepo** : Gestion centralisée des apps et packages ✅
- **Types partagés** : Interfaces TypeScript communes entre frontend/backend ✅
- **CI/CD automatisé** : Workflows GitHub Actions pour linting, tests, builds ✅
- **Configuration centralisée** : TypeScript, ESLint, Prettier unifiés ✅
- **Développement optimisé** : Builds parallèles et cache intelligent ✅

## 🆕 Dernières évolutions (Janvier 2025)

- **Restructuration monorepo** : Organisation apps/ et packages/ avec Turborepo ✅
- **Types unifiés** : Package `@beyana/types` pour la cohérence frontend/backend ✅
- **CI/CD automatisé** : Workflows GitHub Actions opérationnels ✅
- **Admin MVP** : Dashboard fonctionnel avec authentification et gestion produits ✅
- **Tests robustes** : 149/153 tests backend passent (97.4%) ✅

---

## 📋 **VUE D'ENSEMBLE**

**Base URL :** `http://localhost:5000/api`  
**Version :** 2.0  
**Authentification :** JWT Bearer Token  
**Format :** JSON

### **Statut de l'API**

- ✅ **Stable et Testée** : 149/153 tests passent (97.4%)
- ✅ **Documentation Complète** : Tous les endpoints documentés
- ✅ **Sécurité Renforcée** : Validation, rate limiting, CORS
- ✅ **Robustesse** : Gestion d'erreurs, mapping sécurisé, logs nettoyés
- ✅ **Types partagés** : Interfaces cohérentes avec le frontend

---

## 🔐 **AUTHENTIFICATION**

### **Format du Token**

```http
Authorization: Bearer <jwt_token>
```

### **Structure du Token JWT**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

---

## 👥 **UTILISATEURS**

### **POST /api/users/register**

**Inscription d'un nouvel utilisateur**

**Body :**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+33123456789"
}
```

**Réponse (201) :**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+33123456789",
      "role": "user",
      "createdAt": "2024-12-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **POST /api/users/login**

**Connexion utilisateur**

**Body :**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **GET /api/users/profile**

**Récupérer le profil utilisateur** _(Authentifié)_

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+33123456789",
      "addresses": [
        {
          "type": "shipping",
          "street": "123 Main St",
          "city": "Paris",
          "postalCode": "75001",
          "country": "France"
        }
      ],
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  }
}
```

### **PUT /api/users/profile**

**Mettre à jour le profil utilisateur** _(Authentifié)_

**Body :**

```json
{
  "name": "John Updated",
  "phone": "+33987654321",
  "addresses": [
    {
      "type": "shipping",
      "street": "456 New St",
      "city": "Lyon",
      "postalCode": "69001",
      "country": "France"
    }
  ]
}
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Updated",
      "email": "john@example.com",
      "phone": "+33987654321",
      "addresses": [...],
      "updatedAt": "2024-12-01T11:00:00.000Z"
    }
  }
}
```

### **PUT /api/users/change-password**

**Changer le mot de passe** _(Authentifié)_

**Body :**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Réponse (200) :**

```json
{
  "success": true,
  "message": "Mot de passe mis à jour avec succès"
}
```

---

## 🛍️ **PRODUITS**

### **GET /api/products**

**Récupérer la liste des produits avec filtres**

**Query Parameters :**

- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 12)
- `keyword` : Recherche par mot-clé
- `category` : ID de la catégorie
- `price[gte]` : Prix minimum
- `price[lte]` : Prix maximum
- `rating[gte]` : Note minimum
- `sort` : Tri (`price_asc`, `price_desc`, `rating_desc`, `name_asc`)

**Exemple :**

```http
GET /api/products?page=1&limit=12&category=507f1f77bcf86cd799439012&price[gte]=10&price[lte]=100&sort=price_asc
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Huile d'Olive Bio",
        "description": "Huile d'olive extra vierge bio...",
        "price": 15.99,
        "originalPrice": 19.99,
        "images": ["image1.jpg", "image2.jpg"],
        "category": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Huiles"
        },
        "rating": 4.5,
        "reviewCount": 12,
        "stock": 50,
        "isAvailable": true,
        "certifications": ["bio", "fair-trade"],
        "createdAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 60,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### **GET /api/products/:id**

**Récupérer un produit spécifique**

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Huile d'Olive Bio",
      "description": "Huile d'olive extra vierge bio...",
      "price": 15.99,
      "originalPrice": 19.99,
      "images": ["image1.jpg", "image2.jpg"],
      "category": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Huiles"
      },
      "rating": 4.5,
      "reviewCount": 12,
      "stock": 50,
      "isAvailable": true,
      "certifications": ["bio", "fair-trade"],
      "reviews": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "user": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "John Doe"
          },
          "rating": 5,
          "comment": "Excellent produit !",
          "createdAt": "2024-12-01T10:00:00.000Z"
        }
      ],
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  }
}
```

### Exemple de payload complet pour création/modification de produit

```json
{
  "name": "Sirop d'Érable Bio",
  "price": 14.99,
  "category": "id_categorie",
  "images": [
    "https://res.cloudinary.com/beyana/image/upload/v1234567890/sirop-erable.jpg"
  ],
  "isFeatured": true,
  "descriptionShort": "Un sirop d'érable bio pur et savoureux.",
  "descriptionDetailed": "Ce sirop d'érable est récolté dans le respect de l'environnement, sans additifs ni conservateurs. Idéal pour vos pancakes, desserts et boissons.",
  "stockQuantity": 50
}
```

---

## 📦 **COMMANDES**

### **POST /api/orders**

**Créer une nouvelle commande** _(Authentifié)_

**Body :**

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  },
  "paymentMethod": "card"
}
```

**Réponse (201) :**

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439015",
      "user": "507f1f77bcf86cd799439011",
      "items": [
        {
          "product": {
            "_id": "507f1f77bcf86cd799439013",
            "name": "Huile d'Olive Bio",
            "price": 15.99,
            "image": "image1.jpg"
          },
          "quantity": 2,
          "price": 15.99
        }
      ],
      "totalAmount": 31.98,
      "shippingAddress": {...},
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  }
}
```

### **GET /api/orders**

**Récupérer les commandes de l'utilisateur** _(Authentifié)_

**Query Parameters :**

- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `status` : Filtrer par statut

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "items": [...],
        "totalAmount": 31.98,
        "status": "processing",
        "paymentStatus": "paid",
        "createdAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### **GET /api/orders/:id**

**Récupérer une commande spécifique** _(Authentifié)_

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439015",
      "user": "507f1f77bcf86cd799439011",
      "items": [...],
      "totalAmount": 31.98,
      "shippingAddress": {...},
      "status": "processing",
      "paymentStatus": "paid",
      "trackingNumber": "TRK123456789",
      "estimatedDelivery": "2024-12-05T10:00:00.000Z",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T11:00:00.000Z"
    }
  }
}
```

---

## 💳 **PAIEMENTS STRIPE**

### **POST /api/payments/create-payment-intent**

**Créer une intention de paiement** _(Authentifié)_

**Body :**

```json
{
  "orderId": "507f1f77bcf86cd799439015",
  "amount": 3198,
  "currency": "eur"
}
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3OqX8X2eZvKYlo2C1gQJQJQJ_secret_...",
    "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJQJQJ"
  }
}
```

### **POST /api/webhooks/stripe**

**Webhook Stripe pour les événements de paiement**

**Headers :**

```http
Stripe-Signature: t=1640995200,v1=abc123...
Content-Type: application/json
```

**Body (exemple payment_intent.succeeded) :**

```json
{
  "id": "evt_3OqX8X2eZvKYlo2C1gQJQJQJ",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1640995200,
  "data": {
    "object": {
      "id": "pi_3OqX8X2eZvKYlo2C1gQJQJQJ",
      "object": "payment_intent",
      "amount": 3198,
      "currency": "eur",
      "status": "succeeded",
      "metadata": {
        "orderId": "507f1f77bcf86cd799439015"
      }
    }
  },
  "type": "payment_intent.succeeded"
}
```

**Réponse (200) :**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Gestion des événements supportés :**

- ✅ `payment_intent.succeeded` : Mise à jour du statut de commande
- ✅ `payment_intent.payment_failed` : Gestion des échecs de paiement
- ✅ `payment_intent.canceled` : Annulation de commande
- ✅ **Mapping robuste** : Support des structures `order.items` et `order.orderItems`
- ✅ **Synchronisation des tokens** : Gestion automatique de l'authentification

---

## 🏷️ **CATÉGORIES**

### **GET /api/categories**

**Récupérer toutes les catégories**

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Huiles",
        "slug": "huiles",
        "description": "Huiles bio de qualité",
        "image": "huiles.jpg",
        "productCount": 15
      }
    ]
  }
}
```

---

## ⭐ **AVIS**

### **POST /api/reviews**

**Créer un avis sur un produit** _(Authentifié)_

**Body :**

```json
{
  "productId": "507f1f77bcf86cd799439013",
  "rating": 5,
  "comment": "Excellent produit bio !"
}
```

**Réponse (201) :**

```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439014",
      "user": "507f1f77bcf86cd799439011",
      "product": "507f1f77bcf86cd799439013",
      "rating": 5,
      "comment": "Excellent produit bio !",
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  }
}
```

---

## 🖼️ **UPLOAD D'IMAGES**

### **POST /api/upload**

**Uploader une image** _(Authentifié)_

**Headers :**

```http
Content-Type: multipart/form-data
```

**Body :**

```form-data
image: [fichier image]
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg"
  }
}
```

---

## 🔍 **RECHERCHE**

### **GET /api/search**

**Recherche globale**

**Query Parameters :**

- `q` : Terme de recherche
- `type` : Type de recherche (`products`, `categories`, `all`)

**Exemple :**

```http
GET /api/search?q=huile&type=products
```

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "categories": [...],
    "totalResults": 25
  }
}
```

---

## 📊 **STATISTIQUES (ADMIN)**

### **GET /api/admin/stats**

**Statistiques générales** _(Admin)_

**Réponse (200) :**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalOrders": 890,
    "totalRevenue": 45678.90,
    "totalProducts": 150,
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

---

## ⚠️ **GESTION D'ERREURS**

### **Codes d'erreur standards**

**400 - Bad Request :**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

**401 - Unauthorized :**

```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

**403 - Forbidden :**

```json
{
  "success": false,
  "error": "Access denied. Insufficient permissions."
}
```

**404 - Not Found :**

```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 - Internal Server Error :**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🔧 **CONFIGURATION**

### **Variables d'environnement requises**

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/beyana

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Serveur
PORT=5000
NODE_ENV=development

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 📝 **NOTES TECHNIQUES**

### **Bonnes Pratiques Implémentées**

- ✅ **Validation robuste** : Zod pour la validation des schémas
- ✅ **Gestion d'erreurs** : Middleware centralisé avec try/catch
- ✅ **Sécurité** : Rate limiting, CORS, validation des inputs
- ✅ **Performance** : Compression, pagination, indexation MongoDB
- ✅ **Tests** : 149/149 tests passent, couverture complète
- ✅ **Logs** : Winston pour le logging structuré
- ✅ **Mapping sécurisé** : Support des structures de données flexibles

### **Corrections Majeures Appliquées**

- ✅ **Webhooks Stripe** : Gestion robuste des événements de paiement
- ✅ **Mapping des commandes** : Support des structures `order.items` et `order.orderItems`
- ✅ **Synchronisation des tokens** : Gestion automatique de l'authentification
- ✅ **Robustesse TypeScript** : Mapping sécurisé des données, gestion des erreurs
- ✅ **Qualité du code** : Tous les warnings ESLint corrigés

---

**Dernière mise à jour :** Décembre 2024  
**Version API :** 1.0  
**Statut :** Stable et Testée (149/149 tests passent)

## 📝 Changelog API

- 2025-06 : Documentation enrichie, endpoints à jour, exemples revus
- 2025-01 : Migration monorepo, nouveaux endpoints, sécurité renforcée
