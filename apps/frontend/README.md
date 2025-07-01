# Frontend – BEYANA

Ce frontend est développé avec Next.js 15, TypeScript et Tailwind CSS. Il consomme l'API du backend Express/MongoDB et propose une expérience e-commerce moderne, responsive et accessible.

---

## 1. État d'avancement

### ✅ **Structure & Configuration**

- Structure Next.js 15, TypeScript, Tailwind CSS en place
- Pages de base générées (`app/page.tsx`, `app/layout.tsx`)
- Configuration Jest + Testing Library fonctionnelle
- Design system premium avec palette de couleurs bio

### ✅ **Composants UI**

- **Composants de base** : Button, Card, Input, Badge
- **Composants de layout** : Header, Footer
- **Composants métier** : ProductCard, ProductGrid
- **Design responsive** : Mobile-first approach

### ✅ **Page d'Accueil**

- Hero section avec design premium
- Section produits en vedette
- Grille de catégories
- Footer complet avec informations

### ✅ **API Integration (Terminé)**

- **Services API créés** (`src/services/api.ts`)
- **Hooks React pour les données** (`useProducts`, `useFeaturedProducts`)
- **Connexion au backend opérationnelle : les produits vedettes sont affichés sur l'accueil**
- **Route `/api/products/featured` fonctionnelle et intégrée**
- **Backend avec code propre** : Tous les avertissements ESLint corrigés

### 🔄 **Fonctionnalités à développer**

- Pages principales (catalogue, détail produit, panier, checkout)
- Système d'authentification
- Gestion d'état (React Query/SWR, Zustand)
- Tests d'intégration

---

## 2. Priorités immédiates (Sprint en cours)

### **Priorité 1 - API Integration** 🔄

- ✅ Services API créés et fonctionnels
- ✅ Hooks pour récupération des données
- 🔄 Gestion des erreurs et états de chargement
- 🔄 Intercepteurs pour authentification

### **Priorité 2 - Pages Principales** 🔄

- ✅ Page d'accueil avec design premium
- 🔄 Page catalogue produits avec filtres
- 🔄 Page détail produit avec galerie
- 🔄 Page panier et checkout

### **Priorité 3 - Authentification & État** 🔄

- 🔄 Système d'authentification (login/register)
- 🔄 Gestion du panier (ajout/suppression/modification)
- 🔄 Profil utilisateur
- 🔄 Routes protégées

---

## 3. Stack & dépendances principales

### **Core**

- Next.js v15.x
- React v19.x
- TypeScript
- Tailwind CSS v4.x

### **API & État**

- Axios (requêtes API) - ✅ Configuré
- React Query/SWR (gestion d'état serveur) - 🔄 À implémenter
- Zustand (gestion d'état client) - 🔄 À implémenter

### **UI & UX**

- React Hook Form + Zod (formulaires et validation) - 🔄 À implémenter
- Framer Motion (animations) - 🔄 À implémenter
- Lucide React (icônes) - 🔄 À implémenter
- Sonner (notifications) - 🔄 À implémenter

### **Paiement**

- Stripe React (paiement) - 🔄 À implémenter

### **Tests**

- Jest, React Testing Library - ✅ Configurés

---

## 4. Instructions de démarrage

```bash
cd frontend
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) pour voir le résultat.

**Prérequis :**

- Backend démarré sur `http://localhost:5000`
- Base de données peuplée (`npm run seed` dans backend)

---

## 5. Tests

- Tests automatisés frontend avec Jest et Testing Library
- Pour lancer les tests :
  ```bash
  npm test
  ```
- Les fichiers de test doivent être placés dans `src/__tests__` ou nommés `*.test.ts(x)`
- Configuration Jest : voir `jest.config.js`
- **Exemple de test :**
  ```tsx
  // src/__tests__/Sample.test.tsx
  import { render, screen } from "@testing-library/react";
  describe("Sample test", () => {
    it("affiche un texte de test", () => {
      render(<div>Test réussi !</div>);
      expect(screen.getByText(/test réussi/i)).toBeInTheDocument();
    });
  });
  ```

---

## 6. Design System

### **Palette de Couleurs Premium**

```css
--primary-green: #2d5a27; /* Vert bio premium */
--secondary-green: #4a7c59; /* Vert secondaire */
--accent-gold: #d4af37; /* Or pour le premium */
--neutral-cream: #f5f5dc; /* Crème naturel */
--text-dark: #1a1a1a; /* Texte principal */
--text-light: #6b7280; /* Texte secondaire */
```

### **Typographie**

- **Headings** : Inter (moderne, lisible)
- **Body** : Source Sans Pro (naturel, accessible)
- **Accents** : Playfair Display (élégant, premium)

### **Structure des Composants**

```
components/
├── ui/                    // Composants de base réutilisables
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Badge/
│   └── index.ts
├── layout/               // Composants de mise en page
│   ├── Header/
│   ├── Footer/
│   └── Container/
├── features/             // Composants métier
│   ├── ProductCard/
│   ├── ProductGrid/
│   └── FeaturedProductsSection/
└── pages/               // Composants spécifiques aux pages
    └── Home/
```

---

## 7. Roadmap synthétique

| Tâche principale                       | Deadline indicative | Dépend de | Statut      |
| -------------------------------------- | ------------------- | --------- | ----------- |
| Connexion API backend                  | 1-2 semaines        | Backend   | ✅ Terminé  |
| **Page d'accueil (produits vedettes)** | 2 semaines          | Backend   | ✅ Terminé  |
| Pages principales (catalogue, panier…) | 2-4 semaines        | Backend   | 🔄 En cours |
| Gestion d'état, UI, tests              | 3-6 semaines        | Backend   | 🔄 À faire  |
| Sécurité, doc, accessibilité           | 4-8 semaines        | Backend   | 🔄 À faire  |

---

## 8. Bonnes pratiques

- ✅ Vérifier la compatibilité des dépendances à chaque sprint
- ✅ Synchroniser la documentation avec l'état réel du code et de l'API
- 🔄 Prioriser l'accessibilité, la sécurité et la maintenabilité
- ✅ Utiliser le design system défini dans ce document
- ✅ Mettre à jour ce fichier à chaque jalon important

---

## 9. Ressources utiles

- [REST.FRONT.md](./REST.FRONT.md) – Feuille de route frontend détaillée
- [Roadmap Globale](../ROADMAP.md)
- [Documentation Next.js](https://nextjs.org/docs)

---

## 10. État des Services API

### **Services Créés** ✅

- `src/services/api.ts` - Client API avec méthodes typées
- `src/hooks/useProducts.ts` - Hook pour récupérer les produits
- `src/hooks/useFeaturedProducts.ts` - Hook pour les produits en vedette

### **Endpoints Connectés** ✅

- `GET /api/products` - Liste des produits
- `GET /api/products/featured` - **Produits en vedette (✅ INTÉGRÉ)**
- `GET /api/categories` - Liste des catégories

### **Endpoints à Connecter** 🔄

- Authentification (login/register)
- Gestion du panier
- Commandes et paiement
- Profil utilisateur

---

**Dernière mise à jour :** Décembre 2024  
**Prochaine révision :** Janvier 2025  
**Responsable :** Équipe Frontend BEYANA

# BEYANA - Frontend Utilisateur

## Fonctionnalités principales

- Authentification utilisateur classique
- Upload d'avatar Cloudinary instantané (avec toast)
- Synchronisation immédiate du contexte utilisateur
- Migration vers react-hot-toast pour les notifications
- Séparation stricte avec l'admin (port 3001)

## Lancement

- `npm run dev` (port 3001)
- Accès : http://localhost:3001

## Prochaines étapes

- Amélioration continue de l'UX
- Ajout de fonctionnalités e-commerce avancées
