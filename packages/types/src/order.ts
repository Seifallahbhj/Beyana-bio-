import { Product } from "./product";

// Interface pour les éléments de commande
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

// Interface pour les éléments de panier
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

// Interface pour le panier
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour l'adresse de livraison
export interface ShippingAddress {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
}

// Interface pour les éléments de commande dans le payload
export interface OrderItemPayload {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

// Interface pour le payload de commande
export interface OrderPayload {
  orderItems: OrderItemPayload[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

// Interface pour les commandes
export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour la réponse des commandes utilisateur
export interface UserOrdersResponse {
  orders: Order[];
  page: number;
  totalPages: number;
  total: number;
}

// Interface pour les requêtes de paiement
export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  orderId: string;
}

// Interface pour les réponses de paiement
export interface PaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  amount?: number;
  currency?: string;
  message?: string;
}
