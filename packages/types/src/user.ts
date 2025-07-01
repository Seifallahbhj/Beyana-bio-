// Interface pour les adresses utilisateur
export interface UserAddress {
  type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Interface principale pour les utilisateurs
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  isAdmin?: boolean;
  avatar?: string;
  phoneNumber?: string;
  addresses?: UserAddress[];
  wishlist?: string[];
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les credentials de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour les données d'inscription
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Interface pour la réponse d'authentification
export interface AuthResponse {
  user: User;
  token: string;
}
