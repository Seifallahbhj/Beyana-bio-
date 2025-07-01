import { Schema, model, Document, Types } from "mongoose";
import { IAddress, AddressSchema } from "./User.model"; // Importer l'interface Address

// Interface pour un article de la commande
export interface IOrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: Types.ObjectId; // Référence au produit
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    image: { type: String, required: true }, // URL de l'image principale du produit
    price: { type: Number, required: true }, // Prix unitaire au moment de la commande
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { _id: false } // Pas besoin d'un _id séparé pour les sous-documents ici
);

// Interface pour le résultat du paiement
export interface IPaymentResult {
  id: string; // ID de la transaction de la passerelle
  status: string; // Statut du paiement (ex: 'succeeded', 'pending', 'failed')
  update_time?: string; // Timestamp de la dernière mise à jour du paiement
  email_address?: string; // Email de l'acheteur (si fourni par la passerelle)
}

const PaymentResultSchema = new Schema<IPaymentResult>(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    update_time: { type: String },
    email_address: { type: String },
  },
  { _id: false }
);

export interface IOrder extends Document {
  user: Types.ObjectId; // Référence à l'utilisateur
  orderItems: IOrderItem[];
  shippingAddress: IAddress;
  paymentMethod: string; // ex: 'stripe', 'paypal'
  paymentResult?: IPaymentResult;
  itemsPrice: number; // Prix total des articles HT
  taxPrice: number; // Montant de la taxe
  shippingPrice: number; // Frais de port
  totalPrice: number; // Prix total TTC incluant frais de port
  orderStatus:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Refunded"
    | "Payment Failed";
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  trackingNumber?: string;
  notes?: string;
  paymentIntentId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [OrderItemSchema],
    shippingAddress: { type: AddressSchema, required: true },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentResult: { type: PaymentResultSchema },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Payment Failed",
      ],
      default: "Pending",
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Calculer le totalPrice avant de sauvegarder si ce n'est pas déjà fait
OrderSchema.pre<IOrder>("save", function (next) {
  if (
    this.isModified("itemsPrice") ||
    this.isModified("taxPrice") ||
    this.isModified("shippingPrice") ||
    this.isNew
  ) {
    this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  }
  next();
});

const Order = model<IOrder>("Order", OrderSchema);

export default Order;
