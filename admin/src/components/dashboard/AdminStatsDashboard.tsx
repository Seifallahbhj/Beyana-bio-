import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface OrdersByStatus {
  _id: string;
  count: number;
}

interface ProductsByCategory {
  _id: string;
  count: number;
}

export default function AdminStatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    ProductsByCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }
        const data = await res.json();
        setStats(data.stats);
        setOrdersByStatus(data.ordersByStatus || []);
        setProductsByCategory(data.productsByCategory || []);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Chargement des statistiques...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-8 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCard title="Utilisateurs" value={stats.totalUsers} />
        <StatsCard title="Commandes" value={stats.totalOrders} />
        <StatsCard title="Produits" value={stats.totalProducts} />
        <StatsCard
          title="Chiffre d'affaires (€)"
          value={stats.totalRevenue.toLocaleString()}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Commandes par statut</h2>
          <ul className="bg-white rounded shadow p-4">
            {ordersByStatus.length === 0 && <li>Aucune donnée</li>}
            {ordersByStatus.map((s) => (
              <li
                key={s._id}
                className="flex justify-between py-1 border-b last:border-b-0"
              >
                <span>{s._id || "Inconnu"}</span>
                <span className="font-bold">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Produits par catégorie</h2>
          <ul className="bg-white rounded shadow p-4">
            {productsByCategory.length === 0 && <li>Aucune donnée</li>}
            {productsByCategory.map((c) => (
              <li
                key={c._id}
                className="flex justify-between py-1 border-b last:border-b-0"
              >
                <span>{c._id || "Inconnu"}</span>
                <span className="font-bold">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded shadow p-6 flex flex-col items-center">
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="text-gray-600 text-sm text-center">{title}</div>
    </div>
  );
}
