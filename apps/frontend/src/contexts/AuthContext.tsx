"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { apiService, RegisterData, User } from "../services/api";

// Contexte d'authentification pour l'application
// Fournit les fonctions et états liés à l'utilisateur connecté

// Interface du résultat d'authentification
interface AuthResult {
  success: boolean;
  error?: string;
}

// Interface du contexte d'authentification
interface AuthContextType {
  user: User | null; // Utilisateur connecté
  loading: boolean; // Chargement de l'état d'auth
  login: (email: string, password: string) => Promise<AuthResult>; // Connexion
  register: (userData: RegisterData) => Promise<AuthResult>; // Inscription
  logout: () => void; // Déconnexion
  updateProfile: (userData: Partial<User>) => Promise<AuthResult>; // Mise à jour profil
  refreshProfile: () => Promise<void>; // Rafraîchir profil
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Ajouté pour mise à jour directe
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fournisseur du contexte d'authentification
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // État utilisateur et chargement
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effet : Vérifie l'authentification au montage
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          apiService.setToken(token); // Définit le token pour les requêtes
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(() => {
              return response.data ?? null;
            });
          } else {
            apiService.setToken(null);
            setUser(() => {
              return null;
            });
          }
        }
      } catch {
        apiService.setToken(null);
        setUser(() => {
          return null;
        });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const response = await apiService.login({ email, password });
        if (response.success && response.data) {
          setUser(() => {
            return response.data && response.data.user
              ? response.data.user
              : null;
          });
          return { success: true };
        }
        return { success: false, error: response.error };
      } catch {
        return {
          success: false,
          error: "Erreur de communication avec le serveur.",
        };
      }
    },
    []
  );

  // Fonction d'inscription
  const register = useCallback(
    async (userData: RegisterData): Promise<AuthResult> => {
      try {
        const response = await apiService.register(userData);
        if (response.success && response.data) {
          setUser(() => {
            return response.data && response.data.user
              ? response.data.user
              : null;
          });
          return { success: true };
        }
        return { success: false, error: response.error };
      } catch {
        return {
          success: false,
          error: "Erreur de communication avec le serveur.",
        };
      }
    },
    []
  );

  // Fonction de déconnexion
  const logout = useCallback(() => {
    apiService.setToken(null);
    setUser(() => {
      return null;
    });
    // Optionnel: rediriger vers la page de connexion
    // window.location.href = '/auth/login';
  }, []);

  // Fonction de mise à jour du profil utilisateur
  const updateProfile = useCallback(
    async (userData: Partial<User>): Promise<AuthResult> => {
      try {
        const response = await apiService.updateProfile(userData);
        if (response.success && response.data) {
          setUser(() => {
            return response.data && response.data.user
              ? response.data.user
              : null;
          });
          return { success: true };
        }
        return { success: false, error: response.error };
      } catch {
        return {
          success: false,
          error: "Erreur de communication avec le serveur.",
        };
      }
    },
    []
  );

  // Fonction pour rafraîchir le profil utilisateur
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(() => {
          return response.data ?? null;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Valeur du contexte, optimisée avec useMemo
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
      setUser,
    }),
    [user, loading, login, register, logout, updateProfile, refreshProfile]
  );

  // Fournit le contexte à tous les enfants
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
