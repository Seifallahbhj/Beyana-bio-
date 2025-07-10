import asyncHandler from "express-async-handler";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import User from "../models/User.model";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";

// Types pour les filtres
interface OrderFilter {
  orderStatus?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
  user?: string | { $in: string[] };
  totalPrice?: {
    $gte?: number;
    $lte?: number;
  };
}

// Type pour l'utilisateur peuplé
interface PopulatedUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Dashboard stats
const getDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);
    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "firstName lastName email");
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

// Listing commandes avec filtres
const getOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const filter: OrderFilter = {};
    if (req.query.status) filter.orderStatus = req.query.status as string;
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }
    if (req.query.user) filter.user = req.query.user as string;
    if (req.query.email) {
      const user = await User.findOne({ email: req.query.email });
      filter.user = user ? user._id.toString() : "000000000000000000000000";
    }
    if (req.query.name) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: req.query.name, $options: "i" } },
          { lastName: { $regex: req.query.name, $options: "i" } },
        ],
      });
      filter.user =
        users.length > 0
          ? { $in: users.map(u => u._id.toString()) }
          : "000000000000000000000000";
    }
    // Filtres par montant
    if (req.query.minAmount || req.query.maxAmount) {
      filter.totalPrice = {};
      if (req.query.minAmount)
        filter.totalPrice.$gte = Number(req.query.minAmount);
      if (req.query.maxAmount)
        filter.totalPrice.$lte = Number(req.query.maxAmount);
    }
    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate("user", "firstName lastName email");
    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  }
);

// Détail commande
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "firstName lastName email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ order });
});

// Update statut commande
const updateOrderStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
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

// Export CSV (simplifié)
const exportOrdersCSV = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const filter: OrderFilter = {};
    if (req.query.status) filter.orderStatus = req.query.status as string;
    if (req.query.user) filter.user = req.query.user as string;
    if (req.query.email) {
      const user = await User.findOne({ email: req.query.email });
      filter.user = user ? user._id.toString() : "000000000000000000000000";
    }
    if (req.query.name) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: req.query.name, $options: "i" } },
          { lastName: { $regex: req.query.name, $options: "i" } },
        ],
      });
      filter.user =
        users.length > 0
          ? { $in: users.map(u => u._id.toString()) }
          : "000000000000000000000000";
    }
    const orders = await Order.find(filter).populate(
      "user",
      "firstName lastName email"
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=commandes.csv");

    if (orders.length === 0) {
      res.send("Aucune commande trouvée");
      return;
    }

    let csv = "ID,Client,Email,Statut,Total\n";
    orders.forEach(order => {
      const user = order.user as PopulatedUser | null | undefined;
      const firstName = user?.firstName || "";
      const lastName = user?.lastName || "";
      const email = user?.email || "";
      csv += `${order._id},${firstName} ${lastName},${email},${order.orderStatus},${order.totalPrice}\n`;
    });
    res.send(csv);
  }
);

// Export PDF (simplifié)
const exportOrdersPDF = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const filter: OrderFilter = {};
    if (req.query.status) filter.orderStatus = req.query.status as string;
    if (req.query.user) filter.user = req.query.user as string;
    if (req.query.email) {
      const user = await User.findOne({ email: req.query.email });
      filter.user = user ? user._id.toString() : "000000000000000000000000";
    }
    if (req.query.name) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: req.query.name, $options: "i" } },
          { lastName: { $regex: req.query.name, $options: "i" } },
        ],
      });
      filter.user =
        users.length > 0
          ? { $in: users.map(u => u._id.toString()) }
          : "000000000000000000000000";
    }
    const orders = await Order.find(filter).populate(
      "user",
      "firstName lastName email"
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=commandes.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(16).text("Export commandes", { align: "center" });

    if (orders.length === 0) {
      doc.moveDown().fontSize(12).text("Aucune commande trouvée");
    } else {
      orders.forEach(order => {
        const user = order.user as PopulatedUser | null | undefined;
        const firstName = user?.firstName || "";
        const lastName = user?.lastName || "";
        doc
          .moveDown()
          .fontSize(12)
          .text(
            `Commande: ${order._id} | Client: ${firstName} ${lastName} | Total: ${order.totalPrice} €`
          );
      });
    }
    doc.end();
  }
);

// Login admin
const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (user && user.role === "admin" && (await user.comparePassword(password))) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );
    res.json({
      _id: user._id,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials or not an admin");
  }
});

// Listing users (simplifié)
const getUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const users = await User.find().select("-password");
    res.json({ users });
  }
);

// Update user role (simplifié)
const updateUserRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.isAdmin = req.body.isAdmin;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  }
);

// Delete user (simplifié)
const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  }
);

export {
  getDashboardStats,
  getOrders,
  getOrderById,
  updateOrderStatus,
  exportOrdersCSV,
  exportOrdersPDF,
  loginAdmin,
  getUsers,
  updateUserRole,
  deleteUser,
};
