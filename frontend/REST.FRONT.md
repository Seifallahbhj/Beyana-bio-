# Feuille de Route Frontend - Projet BEYANA

Ce document est un guide détaillé pour la création de l'interface utilisateur (UI) et de l'expérience utilisateur (UX) de BEYANA. Le backend étant prêt, le frontend doit traduire la richesse fonctionnelle de l'API en une expérience client moderne, intuitive et engageante, en accord avec l'image de marque "biologique et premium".

---

## 1. État d'Avancement Actuel

### ✅ **Design System et Identité Visuelle - TERMINÉ**

- **Palette de couleurs premium** : Vert bio, or accent, crème naturel
- **Typographie** : Inter, Source Sans Pro, Playfair Display
- **Composants UI de base** : Button, Card, Input, Badge
- **Layout components** : Header, Footer
- **Design responsive** : Mobile-first approach

### ✅ **Structure du Projet - TERMINÉ & STABILISÉ**

- **Next.js 15** avec App Router
- **TypeScript** strict mode
- **Tailwind CSS 4** avec couleurs personnalisées
- **Tests automatisés** : Jest + Testing Library
- **Structure des dossiers** : `/components`, `/hooks`, `/services`
- **Environnement de développement stable** : Ports dédiés (3000/3001/5000) et build fiable.

### ✅ **API Integration - TERMINÉ**

- **Services API** : `src/services/api.ts` créé et fonctionnel
- **Hooks React** : `useProducts`, `useFeaturedProducts` opérationnels
- **Connexion backend** : **Route `/api/products/featured` intégrée avec succès et stable**
- **Page d'accueil** : Design premium avec **données réelles via l'API**
- **Backend qualité** : Tous les avertissements ESLint corrigés, code propre et maintenable, seeder fiabilisé.

### 🔄 **Pages et Fonctionnalités - EN DÉVELOPPEMENT**

- ✅ **Page d'accueil avec hero section et produits vedettes (connectée à l'API)**
- 🔄 Catalogue produits avec filtres et recherche
- 🔄 Page détail produit avec galerie
- 🔄 Système d'authentification
- 🔄 Gestion du panier et checkout

---

## 2. Axe 1 : Design System et Identité Visuelle ✅

**Objectif :** Définir une identité visuelle cohérente et professionnelle.

### ✅ **Palette de Couleurs Premium**

```css
--primary-green: #2d5a27; /* Vert bio premium */
--secondary-green: #4a7c59; /* Vert secondaire */
--accent-gold: #d4af37; /* Or pour le premium */
--neutral-cream: #f5f5dc; /* Crème naturel */
--text-dark: #1a1a1a; /* Texte principal */
--text-light: #6b7280; /* Texte secondaire */
--success-green: #10b981; /* Succès */
--warning-orange: #f59e0b; /* Attention */
--error-red: #ef4444; /* Erreur */
--info-blue: #3b82f6; /* Information */
```

### ✅ **Typographie**

- **Headings** : Inter (moderne, lisible)
- **Body** : Source Sans Pro (naturel, accessible)
- **Accents** : Playfair Display (élégant, premium)

### ✅ **Composants UI de Base**

- **Button** : Variantes primary, secondary, outline, ghost
- **Card** : Pour produits, catégories, informations
- **Input** : Champs de saisie avec validation
- **Badge** : Étiquettes et statuts
- **Header** : Navigation responsive
- **Footer** : Liens et informations

---

## 3. Axe 2 : Structure du Projet et Outils ✅

**Objectif :** Mise en place d'une base de code propre, évolutive et facile à maintenir.

### ✅ **Structure des Dossiers**

```
src/
├── app/                    # App Router Next.js 15
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── ui/               # Composants de base
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── index.ts
│   ├── layout/           # Composants de structure
│   │   ├── Header/
│   │   └── Footer/
│   └── features/         # Composants métier
│       ├── ProductCard/
│       ├── ProductGrid/
│       └── FeaturedProductsSection/
├── hooks/                # Hooks personnalisés
│   ├── useProducts.ts
│   └── useFeaturedProducts.ts
├── services/             # Services API
│   └── api.ts
└── __tests__/           # Tests automatisés
    └── Sample.test.tsx
```

### ✅ **Gestion de l'État (En cours)**

- **État du serveur** : Hooks personnalisés pour API
- **État global du client** : À implémenter (Zustand/Context)

---

## 4. Axe 3 : Développement des Pages et Composants 🔄

**Objectif :** Construire l'ensemble des interfaces de l'application.

### ✅ **Page d'Accueil (`/`) - TERMINÉE**

- ✅ Hero section avec design premium
- ✅ **Section "Produits en Vedette" avec données réelles de l'API**
- ✅ Grille des "Catégories Populaires"
- ✅ Footer complet avec informations
- ✅ Design responsive et moderne

### 🔄 **Pages Principales - EN DÉVELOPPEMENT**

#### **Page Produits (`/products`) - À DÉVELOPPER**

- 🔄 Barre latérale de filtres (catégories, prix, attributs)
- 🔄 Options de tri en haut de la liste
- 🔄 Grille de `ProductCard` avec pagination
- 🔄 Recherche avancée avec suggestions

#### **Page Détail Produit (`/products/[slug]`) - À DÉVELOPPER**

- 🔄 Galerie d'images avec zoom
- 🔄 Informations principales (titre, prix, note moyenne)
- 🔄 Sélecteur de quantité et bouton "Ajouter au panier"
- 🔄 Système d'onglets (Description, Ingrédients, Avis)
- 🔄 Section "Produits Similaires"

#### **Page Panier (`/cart`) - À DÉVELOPPER**

- 🔄 Liste des produits avec modification/suppression
- 🔄 Résumé de la commande (sous-total, frais de port, total)
- 🔄 Bouton "Passer la commande"

#### **Tunnel de Commande (`/checkout`) - À DÉVELOPPER**

- 🔄 Étape 1 : Adresse de livraison
- 🔄 Étape 2 : Paiement (Stripe Elements)
- 🔄 Étape 3 : Confirmation de commande

### 🔄 **Pages d'Authentification - À DÉVELOPPER**

- 🔄 Pages `Login` et `Register`
- 🔄 **Espace Compte (`/account`)** - Routes protégées :
  - `/account/dashboard` : Vue d'ensemble
  - `/account/orders` : Historique des commandes
  - `/account/profile` : Modifier les informations
  - `/account/addresses` : Gérer les adresses

---

## 5. Axe 4 : Intégration API et Logique Métier 🔄

**Objectif :** Rendre l'application dynamique en la connectant au backend.

### ✅ **Service API - TERMINÉ**

- ✅ Client `axios` pré-configuré avec l'URL de base
- ✅ Méthodes typées pour tous les endpoints
- ✅ Gestion des erreurs de base
- 🔄 Intercepteur pour JWT (à implémenter)

### ✅ **Hooks React - TERMINÉS**

- ✅ `useProducts` : Récupération des produits
- ✅ `useFeaturedProducts` : **Produits en vedette (utilisé en production sur la page d'accueil)**
- ✅ Gestion des états de chargement
- 🔄 Gestion des erreurs avancée (à améliorer)

### 🔄 **Logique d'Authentification - À DÉVELOPPER**

- 🔄 Stockage sécurisé du token JWT
- 🔄 `AuthContext` ou store Zustand
- 🔄 Routes protégées
- 🔄 Gestion de la déconnexion

### 🔄 **Logique du Panier - À DÉVELOPPER**

- 🔄 Gestion de l'état du panier (Zustand/Context)
- 🔄 Persistance `localStorage`
- 🔄 Calculs automatiques (total, frais de port)

---

## 6. Axe 5 : Stack Technique Recommandée 🔄

**Objectif :** S'assurer que les nouvelles dépendances sont modernes et compatibles.

### ✅ **Dépendances Installées**

- **Next.js 15** avec App Router
- **React 19** avec TypeScript
- **Tailwind CSS 4** avec couleurs personnalisées
- **Jest + Testing Library** pour les tests
- **Axios** pour les requêtes API

### 🔄 **Dépendances à Installer**

```bash
npm install @tanstack/react-query zustand react-hook-form zod framer-motion lucide-react sonner @stripe/react-stripe-js @stripe/stripe-js
```

### **Dépendances Recommandées**

- **TanStack Query** (`@tanstack/react-query`) : Gestion d'état serveur
- **Zustand** (`zustand`) : Gestion d'état client
- **React Hook Form** (`react-hook-form`) : Formulaires performants
- **Zod** (`zod`) : Validation de données
- **Framer Motion** (`framer-motion`) : Animations fluides
- **Lucide React** (`lucide-react`) : Icônes modernes
- **Sonner** (`sonner`) : Notifications élégantes
- **Stripe React** (`@stripe/react-stripe-js`) : Paiements sécurisés

---

## 7. Roadmap Détaillée

### **Phase 1 : Foundation (Semaines 1-2) ✅**

- ✅ Setup Tailwind CSS avec couleurs personnalisées
- ✅ Configuration des polices
- ✅ Création des composants UI de base
- ✅ Tests unitaires pour les composants
- ✅ **Page d'accueil avec design premium et données réelles**

### **Phase 2 : Core Features (Semaines 3-4) 🔄**

- ✅ **API Integration de base (TERMINÉE)**
- 🔄 Page catalogue produits avec filtres
- 🔄 Page détail produit avec galerie
- 🔄 Système d'authentification
- 🔄 Gestion du panier

### **Phase 3 : Advanced UX (Semaines 5-6) 🔄**

- 🔄 Processus de checkout en 3 étapes
- 🔄 Intégration Stripe pour paiements
- 🔄 Gestion des adresses de livraison
- 🔄 Optimisations performance
- 🔄 Tests d'intégration

### **Phase 4 : Polish & Launch (Semaines 7-8) 🔄**

- 🔄 Animations et micro-interactions
- 🔄 Tests complets (unit, integration, e2e)
- 🔄 Optimisations finales
- 🔄 Documentation utilisateur
- 🔄 Déploiement production

---

## 8. Métriques de Succès

### **Performance**

- **Lighthouse Score** : > 90/100
- **Temps de chargement** : < 2s
- **Core Web Vitals** : Optimaux
- **Mobile Performance** : > 90/100

### **UX Metrics**

- **Conversion Rate** : > 3%
- **Temps sur site** : > 3 minutes
- **Taux de rebond** : < 40%
- **Taux d'abandon panier** : < 70%

### **Accessibilité**

- **WCAG 2.1 AA** : 100% compliant
- **Support clavier** : 100%
- **Contraste** : 4.5:1 minimum
- **Screen readers** : Compatible

---

## 9. Priorités Immédiates

### **Cette Semaine (Priorité 1)**

1. ✅ **API Integration de base (TERMINÉ)**
2. 🔄 Page catalogue produits avec filtres
3. 🔄 Système d'authentification
4. 🔄 Gestion du panier

### **Semaine Prochaine (Priorité 2)**

1. 🔄 Page détail produit
2. 🔄 Processus de checkout
3. 🔄 Tests d'intégration
4. 🔄 Optimisations performance

### **Mois Prochain (Priorité 3)**

1. 🔄 Animations et micro-interactions
2. 🔄 Tests utilisateur
3. 🔄 Documentation
4. 🔄 Déploiement production

---

**Dernière mise à jour :** Décembre 2024  
**Prochaine révision :** Janvier 2025  
**Responsable :** Équipe Frontend BEYANA
