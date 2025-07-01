"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

// Composant ProtectedRoute : protège une route en vérifiant l'authentification utilisateur

// Props du composant ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode; // Composant(s) à protéger
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-primary-green"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
