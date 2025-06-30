"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifie le token au chargement
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (storedToken) {
      setToken(storedToken);
      // Optionnel : fetch profile admin ici pour valider le token
      // Pour l'instant, on suppose que le token est valide
      setAdmin({ _id: "", email: "", role: "admin" });
    }
    setLoading(false);
  }, []);

  const login = (token: string, user: AdminUser) => {
    setToken(token);
    setAdmin(user);
    localStorage.setItem("adminToken", token);
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
