"use client";
import { useState, useEffect, useCallback } from "react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OrderFilters from "@/components/orders/OrderFilters";
import OrderExportButtons from "@/components/orders/OrderExportButtons";
import OrdersTable from "@/components/orders/OrdersTable";

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
  search: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      let url = `/admin/orders?page=${page}&limit=10`;

      if (filters.status) url += `&status=${filters.status}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;

      const res = await apiService.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders);
      setTotalPages(res.data.pages);
    } catch {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPage(1);
  };

  const handleViewInvoice = (orderId: string) => {
    const token = localStorage.getItem("adminToken");
    const url = `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/invoice`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la génération de la facture");
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `facture-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Erreur facture PDF:", error);
        toast.error("Erreur lors de la génération de la facture");
      });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await apiService.put(
        `/admin/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Statut de la commande mis à jour");
      fetchOrders();
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handlePDFExport = () => {
    const token = localStorage.getItem("adminToken");
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    // Ajoute un fallback si la variable d'env est undefined
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    console.log("API URL PDF:", apiUrl); // Debug
    const url = `${apiUrl}/admin/orders/export/pdf?${params.toString()}`;
    console.log("Full PDF URL:", url); // Debug

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error("Erreur lors de l'export PDF");
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `commandes_${new Date().toISOString().split("T")[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Erreur export PDF:", error);
        alert("Erreur lors de l'export PDF");
      });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des Commandes</h1>

        {/* Boutons d'export */}
        <OrderExportButtons
          filters={filters}
          onExportCSV={() => {}} // Géré directement dans le composant
          onExportPDF={handlePDFExport}
          isLoading={loading}
        />
      </div>

      {/* Filtres avancés */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tableau des commandes */}
      <OrdersTable
        orders={orders}
        onStatusChange={updateOrderStatus}
        onViewInvoice={handleViewInvoice}
        isLoading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} sur {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
