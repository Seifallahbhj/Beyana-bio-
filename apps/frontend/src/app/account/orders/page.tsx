"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Order } from "@/services/api";
import { Package, Calendar, MapPin, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import RobustImage from "@/components/ui/RobustImage";
import { ProductSVG } from "@/components/ui/ProductSVG";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En cours";
    case "shipped":
      return "Expédiée";
    case "delivered":
      return "Livrée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
};

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "processing", label: "En cours" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

type OrderProduct = {
  product: {
    name: string;
    images: string[];
    // Ajoute d'autres champs si besoin
  };
  quantity: number;
  price: number;
};

type OrderWithItems = Order & {
  orderItems?: OrderProduct[];
  totalPrice?: number;
  items?: OrderProduct[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const userId = user?._id;
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Synchronise le token à chaque chargement (important pour SSR/CSR)
  useEffect(() => {
    apiService.setToken(
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    );
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getUserOrders({
          page,
          status: statusFilter,
        });
        if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
        setTotalPages(
          response.data && response.data.totalPages
            ? response.data.totalPages
            : 1
        );
      } catch {
        setOrders([]);
        setTotalPages(1);
        setError("Erreur de communication avec le serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId, page, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-2 h-6 w-6 text-primary-green" />
            Mes Commandes
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-2 h-6 w-6 text-primary-green" />
            Mes Commandes
          </h2>
        </div>
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-2 h-6 w-6 text-primary-green" />
            Mes Commandes
          </h2>
          <p className="text-gray-600 mt-1">
            Consultez l&apos;historique de vos commandes
          </p>
        </div>
        {/* Filtrage par statut */}
        <div>
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filtrer par statut
          </label>
          <select
            id="statusFilter"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1); // reset page on filter change
            }}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      {Array.isArray(orders) && orders.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune commande
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <div className="mt-6">
            <Link href="/products">
              <Button>Découvrir nos produits</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(orders) &&
            orders.length > 0 &&
            orders.map(order => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-6 bg-white"
              >
                {/* En-tête de la commande */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Commande #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                {/* Adresse de livraison */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900 mb-1">
                        Adresse de livraison
                      </div>
                      <div>
                        {order.shippingAddress?.street}
                        <br />
                        {order.shippingAddress?.zipCode}{" "}
                        {order.shippingAddress?.city}
                        <br />
                        {order.shippingAddress?.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produits de la commande */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Produits commandés
                  </h4>
                  <div className="space-y-2">
                    {Array.isArray(order.orderItems)
                      ? order.orderItems.map(
                          (item: OrderProduct, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <RobustImage
                                  src={
                                    item.product?.images?.[0] ||
                                    "/placeholder.png"
                                  }
                                  alt={item.product?.name || "Produit"}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg mr-3"
                                  fallbackSvg={<ProductSVG />}
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.product?.name || "Produit"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Quantité: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            </div>
                          )
                        )
                      : Array.isArray(order.items)
                        ? order.items.map(
                            (item: OrderProduct, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center">
                                  <RobustImage
                                    src={
                                      item.product?.images?.[0] ||
                                      "/placeholder.png"
                                    }
                                    alt={item.product?.name || "Produit"}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-cover rounded-lg mr-3"
                                    fallbackSvg={<ProductSVG />}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {item.product?.name || "Produit"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Quantité: {item.quantity}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        : null}
                  </div>
                </div>

                {/* Total et actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                  <div className="mb-4 sm:mb-0">
                    <div className="text-lg font-bold text-gray-900">
                      Total: {formatPrice(order.totalPrice ?? order.total)}
                    </div>
                  </div>
                  <Link href={`/account/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir les détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="px-3 py-2 text-sm font-medium text-gray-700">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
