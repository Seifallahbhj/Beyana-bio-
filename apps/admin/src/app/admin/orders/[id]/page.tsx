"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface PaymentResult {
  id: string;
  status: string;
  update_time?: string;
  email_address?: string;
}

interface Order {
  _id: string;
  user?: { firstName?: string; lastName?: string; email?: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  paidAt?: string | Date;
  isDelivered: boolean;
  deliveredAt?: string | Date;
  trackingNumber?: string;
  notes?: string;
  paymentIntentId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then: unknown }).then === "function"
  );
}

export default function OrderDetailPage({
  params,
}: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isPromise<{ id: string }>(params)) {
      params.then(p => setOrderId(p.id));
    } else {
      setOrderId((params as { id: string }).id);
    }
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/orders/${orderId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok)
          throw new Error("Erreur lors du chargement de la commande");
        const data = await res.json();
        setOrder(data.order);
      } catch (e) {
        const error = e as Error;
        setError(error.message);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (error) return <div style={{ padding: "2rem" }}>Erreur : {error}</div>;
  if (!order) return <div style={{ padding: "2rem" }}>Chargement...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Détail de la commande</h1>
      <p>
        <b>ID :</b> {order._id}
      </p>
      <p>
        <b>Client :</b> {order.user?.firstName} {order.user?.lastName} (
        {order.user?.email || "—"})
      </p>

      {/* Bloc adresse */}
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          background: "#222",
          borderRadius: 8,
        }}
      >
        <h2>Adresse de livraison</h2>
        <div>
          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
          <br />
          {order.shippingAddress?.address}
          <br />
          {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
          <br />
          {order.shippingAddress?.country}
          <br />
          {order.shippingAddress?.phone && (
            <>Tél : {order.shippingAddress.phone}</>
          )}
        </div>
      </div>

      {/* Tableau des articles */}
      <div style={{ margin: "2rem 0" }}>
        <h2>Articles</h2>
        <table
          style={{ width: "100%", background: "#181818", borderRadius: 8 }}
        >
          <thead>
            <tr>
              <th>Image</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, idx) => (
              <tr key={item.product || idx}>
                <td>
                  <Image
                    src={item.image || "/images/placeholder-product.svg"}
                    alt={item.name || "Produit"}
                    width={50}
                    height={50}
                    style={{ borderRadius: 4, objectFit: "cover" }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price} €</td>
                <td>{(item.price * item.quantity).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé */}
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          background: "#222",
          borderRadius: 8,
        }}
      >
        <h2>Résumé</h2>
        <p>
          <b>Total articles (HT) :</b> {order.itemsPrice} €
        </p>
        <p>
          <b>TVA :</b> {order.taxPrice} €
        </p>
        <p>
          <b>Frais de port :</b> {order.shippingPrice} €
        </p>
        <p>
          <b>Total TTC :</b> {order.totalPrice} €
        </p>
      </div>

      {/* Statuts et dates */}
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          background: "#222",
          borderRadius: 8,
        }}
      >
        <h2>Statuts & Dates</h2>
        <p>
          <b>Statut commande :</b> {order.orderStatus}
        </p>
        <p>
          <b>Payée :</b> {order.isPaid ? "Oui" : "Non"}{" "}
          {order.paidAt &&
            `(le ${new Date(order.paidAt as string).toLocaleString()})`}
        </p>
        <p>
          <b>Livrée :</b> {order.isDelivered ? "Oui" : "Non"}{" "}
          {order.deliveredAt &&
            `(le ${new Date(order.deliveredAt as string).toLocaleString()})`}
        </p>
        {order.trackingNumber && (
          <p>
            <b>Numéro de suivi :</b> {order.trackingNumber}
          </p>
        )}
        {order.notes && (
          <p>
            <b>Notes :</b> {order.notes}
          </p>
        )}
        <p>
          <b>Créée le :</b>{" "}
          {new Date(order.createdAt as string).toLocaleString()}
        </p>
      </div>

      {/* Paiement */}
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          background: "#222",
          borderRadius: 8,
        }}
      >
        <h2>Paiement</h2>
        <p>
          <b>Méthode :</b> {order.paymentMethod}
        </p>
        {order.paymentResult && (
          <>
            <p>
              <b>ID transaction :</b> {order.paymentResult.id}
            </p>
            <p>
              <b>Statut paiement :</b> {order.paymentResult.status}
            </p>
            {order.paymentResult.email_address && (
              <p>
                <b>Email acheteur :</b> {order.paymentResult.email_address}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
