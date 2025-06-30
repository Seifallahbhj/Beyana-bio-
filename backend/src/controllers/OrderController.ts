// src/controllers/OrderController.ts
import asyncHandler from "express-async-handler";
import { Response } from "express";
import Order from "../models/Order.model";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Stripe from "stripe";
import dotenv from "dotenv";
import Product from "../models/Product.model";
import { IOrder } from "../models/Order.model";
import PDFDocument from "pdfkit";
import { Types } from "mongoose";
dotenv.config();

// Initialisation de Stripe
let stripe: Stripe;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables"
    );
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
} catch {
  // console.error("Error initializing Stripe:", _error);
  process.exit(1);
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: "No order items" });
      return;
    }

    // Vérifier que tous les produits existent
    const productIds = orderItems.map(
      (item: IOrder["orderItems"][0]) => item.product
    );
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    if (existingProducts.length !== productIds.length) {
      res.status(400).json({ message: "One or more products not found" });
      return;
    }

    const order = new Order({
      orderItems: orderItems.map((item: IOrder["orderItems"][0]) => ({
        ...item,
        product: item.product,
      })),
      user: req.user._id,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        zipCode: shippingAddress.zipCode,
        state: shippingAddress.state,
        country: shippingAddress.country,
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  }
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Le middleware 'protect' garantit que req.user est défini.
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Optional: Check if the user is an admin or the owner of the order
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        });
        return;
      }
      res.json({
        success: true,
        data: order,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
  }
);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Le middleware 'protect' garantit que req.user est défini.
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    const orders = await Order.find({ user: req.user._id });
    res.json({
      success: true,
      data: orders,
    });
  }
);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Vérifier que l'utilisateur est autorisé
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
      return;
    }

    // Vérifier le statut du paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.body.paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
      return;
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    order.orderStatus = "Processing";

    const updatedOrder = await order.save();
    res.json({
      success: true,
      data: updatedOrder,
    });
  }
);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Not authorized as admin",
      });
      return;
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    order.orderStatus = status;

    // Mettre à jour les champs en fonction du statut
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json({
      success: true,
      data: updatedOrder,
    });
  }
);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Not authorized as admin",
      });
      return;
    }

    const orders = await Order.find({}).populate("user", "id name email");
    res.json({
      success: true,
      data: orders,
    });
  }
);

// @desc    Générer la facture PDF d'une commande
// @route   GET /api/orders/:id/invoice
// @access  Private (acheteur ou admin)
const generateInvoice = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
      return;
    }
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    const typedOrder = order.toObject() as unknown as IOrder & {
      user: { _id: Types.ObjectId; name: string; email: string };
      createdAt: Date;
    };
    // Seul l'acheteur ou un admin peut accéder à la facture
    if (
      typedOrder.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to view this invoice",
      });
      return;
    }
    // Préparation du PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Facture-${typedOrder._id}.pdf`
    );
    doc.pipe(res);
    // En-tête
    doc.fontSize(20).text("Facture", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Commande n°: ${typedOrder._id}`);
    doc.text(`Date: ${typedOrder.createdAt.toLocaleDateString()}`);
    doc.text(`Client: ${typedOrder.user.name} <${typedOrder.user.email}>`);
    doc.moveDown();
    // Adresse de livraison
    doc.fontSize(12).text("Adresse de livraison:");
    doc.text(
      `${typedOrder.shippingAddress.address}, ${typedOrder.shippingAddress.zipCode} ${typedOrder.shippingAddress.city}, ${typedOrder.shippingAddress.country}`
    );
    doc.moveDown();
    // Tableau des produits
    doc.fontSize(12).text("Produits:");
    typedOrder.orderItems.forEach(
      (item: IOrder["orderItems"][0], idx: number) => {
        doc.text(
          `${idx + 1}. ${item.name} x${item.quantity} - ${item.price.toFixed(
            2
          )} €`
        );
      }
    );
    doc.moveDown();
    // Totaux
    doc.fontSize(12).text(`Sous-total: ${typedOrder.itemsPrice.toFixed(2)} €`);
    doc.text(`Frais de livraison: ${typedOrder.shippingPrice.toFixed(2)} €`);
    doc.text(`Taxes: ${typedOrder.taxPrice.toFixed(2)} €`);
    doc
      .fontSize(14)
      .text(`Total: ${typedOrder.totalPrice.toFixed(2)} €`, { bold: true });
    doc.end();
  }
);

export {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
  generateInvoice,
};
