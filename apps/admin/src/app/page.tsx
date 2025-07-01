"use client";
// import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminStatsDashboard from "../components/dashboard/AdminStatsDashboard";
// import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    setToken(t);
    // Si pas de token, rediriger vers /login
    if (!t) router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Dashboard Admin</h1>
      <p className="mb-2">Bienvenue sur le dashboard administrateur !</p>
      {token && (
        <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
          <strong>Token stocké :</strong> {token.slice(0, 32)}... (tronqué)
        </div>
      )}
      <AdminStatsDashboard />
    </div>
  );
}
