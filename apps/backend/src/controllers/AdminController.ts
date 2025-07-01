import asyncHandler from "express-async-handler";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import User from "../models/User.model";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import jwt from "jsonwebtoken";

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Check if user is an admin
    if (!req.user?.isAdmin) {
      res.status(403); // 403 Forbidden is more appropriate
      throw new Error("Not authorized as an admin");
    }

    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Chiffre d'affaires total
    const revenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Commandes par statut
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Produits par catégorie
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Commandes récentes
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: revenue[0]?.total || 0,
      },
      ordersByStatus,
      productsByCategory,
      recentOrders,
    });
  }
);

interface OrderFilter {
  orderStatus?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}

// @desc    Get all orders with filtering
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403); // 403 Forbidden
      throw new Error("Not authorized as an admin");
    }

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Construire le filtre
    const filter: OrderFilter = {};

    // Filtrage par statut
    if (req.query.status) {
      filter.orderStatus = req.query.status as string;
    }

    // Filtrage par date
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate("user", "name email");

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  }
);

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403); // 403 Forbidden
      throw new Error("Not authorized as an admin");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.orderStatus = req.body.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  }
);

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (user && user.role === "admin" && (await user.comparePassword(password))) {
    // Vérification explicite du secret JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    // Générer un token JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials or not an admin");
  }
});

export { getDashboardStats, getOrders, updateOrderStatus, loginAdmin };
