"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";

interface OrderDetailProps {
  params: { id: string };
}

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
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

const OrderDetailPage = ({ params }: OrderDetailProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await apiService.get(`/admin/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.order);
      } catch {
        setError("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Aucune donnée à afficher.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Détail de la commande #{order._id.slice(-8)}
      </h1>
      <div className="mb-4">
        <strong>Date :</strong>{" "}
        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
      </div>
      <div className="mb-4">
        <strong>Client :</strong> {order.user?.firstName} {order.user?.lastName}{" "}
        <br />
        <strong>Email :</strong> {order.user?.email}
      </div>
      <div className="mb-4">
        <strong>Statut :</strong> {order.orderStatus} <br />
        <strong>Payée :</strong>{" "}
        {order.isPaid
          ? `Oui (${order.paidAt ? new Date(order.paidAt).toLocaleDateString("fr-FR") : ""})`
          : "Non"}{" "}
        <br />
        <strong>Livrée :</strong>{" "}
        {order.isDelivered
          ? `Oui (${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString("fr-FR") : ""})`
          : "Non"}
      </div>
      <div className="mb-4">
        <strong>Méthode de paiement :</strong> {order.paymentMethod}
      </div>
      <div className="mb-4">
        <strong>Adresse de livraison :</strong>
        <br />
        {order.shippingAddress.address}, {order.shippingAddress.zipCode}{" "}
        {order.shippingAddress.city}, {order.shippingAddress.country}
      </div>
      <div className="mb-4">
        <strong>Articles :</strong>
        <ul className="list-disc ml-6">
          {order.orderItems.map((item, idx) => (
            <li key={idx}>
              {item.name} — {item.quantity} × {item.price.toFixed(2)} €
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <strong>Sous-total :</strong> {order.itemsPrice.toFixed(2)} €<br />
        <strong>Frais de livraison :</strong> {order.shippingPrice.toFixed(2)} €
        <br />
        <strong>Taxes :</strong> {order.taxPrice.toFixed(2)} €<br />
        <strong>Total :</strong> {order.totalPrice.toFixed(2)} €
      </div>
      <button
        className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => router.back()}
      >
        Retour
      </button>
    </div>
  );
};

export default OrderDetailPage;
