"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { Order } from "@/services/api";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import RobustImage from "@/components/ui/RobustImage";
import toast from "react-hot-toast";

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
      return "En cours de traitement";
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return Package;
    case "processing":
      return Package;
    case "shipped":
      return Truck;
    case "delivered":
      return CheckCircle;
    case "cancelled":
      return Package;
    default:
      return Package;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case "paid":
      return "Payé";
    case "pending":
      return "En attente";
    case "failed":
      return "Échoué";
    default:
      return status;
  }
};

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
  items?: OrderProduct[];
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiService.getOrder(id);
        if (response.success && response.data && isMounted) {
          setOrder(response.data);
        }
      } catch {
        // Handle error
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    }
    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/invoice`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok)
        throw new Error("Erreur lors du téléchargement de la facture");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facture-${order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Facture téléchargée !");
    } catch {
      toast.error("Erreur lors du téléchargement de la facture");
    } finally {
      setDownloading(false);
    }
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Commande non trouvée
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette commande n&apos;existe pas ou vous n&apos;y avez pas accès.
          </p>
          <div className="mt-6">
            <Link href="/account/orders">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux commandes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="p-6">
      {/* Header avec navigation */}
      <div className="mb-6">
        <Link href="/account/orders">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux commandes
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-2 h-6 w-6 text-primary-green" />
              Commande #{order._id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-gray-600 mt-1">
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Badge className={getStatusColor(order.status)}>
              <StatusIcon className="mr-1 h-4 w-4" />
              {getStatusText(order.status)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              <CreditCard className="mr-1 h-4 w-4" />
              {getPaymentStatusText(order.paymentStatus)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Produits de la commande */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Produits commandés
            </h3>
            <div className="space-y-4">
              {Array.isArray(order?.orderItems)
                ? order.orderItems.map((item: OrderProduct, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                    >
                      <RobustImage
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.name || "Produit"}
                        width={80}
                        height={80}
                        className="rounded object-cover w-20 h-20 border"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product?.name || "Produit"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prix unitaire: {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))
                : Array.isArray(order?.items)
                ? order.items.map((item: OrderProduct, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                    >
                      <RobustImage
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.name || "Produit"}
                        width={80}
                        height={80}
                        className="rounded object-cover w-20 h-20 border"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product?.name || "Produit"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prix unitaire: {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary-green" />
              Adresse de livraison
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-700">
                <div className="font-medium">
                  {order.shippingAddress.street}
                </div>
                <div>
                  {order.shippingAddress.zipCode} {order.shippingAddress.city}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé et actions */}
        <div className="space-y-6">
          {/* Résumé de la commande */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé de la commande
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">Gratuite</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA</span>
                <span className="font-medium">Incluse</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-sm">
                <span className="text-gray-600">Méthode de paiement:</span>
                <div className="font-medium mt-1">{order.paymentMethod}</div>
              </div>

              {order.paymentStatus === "paid" && (
                <Button
                  className="w-full flex items-center justify-center"
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                >
                  {downloading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-green mr-2"></span>{" "}
                      Téléchargement...
                    </span>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger la facture
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Informations de suivi */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary-green" />
              Informations de suivi
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Commande passée:</span>
                <div className="font-medium">{formatDate(order.createdAt)}</div>
              </div>
              <div>
                <span className="text-gray-600">Dernière mise à jour:</span>
                <div className="font-medium">{formatDate(order.updatedAt)}</div>
              </div>
              <div>
                <span className="text-gray-600">Numéro de commande:</span>
                <div className="font-medium font-mono">{order._id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
