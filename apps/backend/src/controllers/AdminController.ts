import asyncHandler from "express-async-handler";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import User from "../models/User.model";
import Order, { IOrder } from "../models/Order.model";
import Product from "../models/Product.model";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";

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

interface UserFilter {
  $or?: Array<{
    firstName?: { $regex: string; $options: string };
    lastName?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
  isAdmin?: boolean;
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface UpdateOrderRequest extends AuthenticatedRequest {
  body: {
    status: string;
  };
}

interface UpdateUserRoleRequest extends AuthenticatedRequest {
  body: {
    isAdmin: boolean;
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
  async (req: UpdateOrderRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403); // 403 Forbidden
      throw new Error("Not authorized as an admin");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.orderStatus = req.body.status as IOrder["orderStatus"];
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  }
);

// @desc    Export orders to CSV
// @route   GET /api/admin/orders/export/csv
// @access  Private/Admin
const exportOrdersCSV = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }

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

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    // Générer le CSV
    const csvHeaders = [
      "ID Commande",
      "Date",
      "Client",
      "Email",
      "Statut",
      "Méthode de paiement",
      "Sous-total (€)",
      "Frais de livraison (€)",
      "Taxes (€)",
      "Total (€)",
      "Payé",
      "Livré",
      "Adresse de livraison",
    ];

    const csvRows = orders.map(order => {
      // On force le typage pour que TypeScript accepte les propriétés dynamiques
      const orderObj = order.toObject() as any;

      // Gestion du user peuplé ou non
      let userName = "";
      let userEmail = "";
      if (
        orderObj.user &&
        typeof orderObj.user === "object" &&
        ("name" in orderObj.user || "firstName" in orderObj.user)
      ) {
        userName =
          orderObj.user.name ||
          [orderObj.user.firstName, orderObj.user.lastName]
            .filter(Boolean)
            .join(" ") ||
          "";
        userEmail = orderObj.user.email || "";
      }

      return [
        orderObj._id?.toString() || "N/A",
        orderObj.createdAt
          ? new Date(orderObj.createdAt).toLocaleDateString("fr-FR")
          : "N/A",
        userName,
        userEmail,
        orderObj.orderStatus || "N/A",
        orderObj.paymentMethod || "N/A",
        (orderObj.itemsPrice || 0).toFixed(2),
        (orderObj.shippingPrice || 0).toFixed(2),
        (orderObj.taxPrice || 0).toFixed(2),
        (orderObj.totalPrice || 0).toFixed(2),
        orderObj.isPaid ? "Oui" : "Non",
        orderObj.isDelivered ? "Oui" : "Non",
        orderObj.shippingAddress
          ? `${orderObj.shippingAddress.address || ""}, ${orderObj.shippingAddress.zipCode || ""} ${orderObj.shippingAddress.city || ""}, ${orderObj.shippingAddress.country || ""}`
          : "",
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    // Définir les headers pour le téléchargement
    const filename = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", Buffer.byteLength(csvContent, "utf8"));

    res.send(csvContent);
  }
);

// @desc    Export orders to PDF
// @route   GET /api/admin/orders/export/pdf
// @access  Private/Admin
const exportOrdersPDF = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }

    // Filtrage
    const filter: OrderFilter = {};
    if (req.query.status) filter.orderStatus = req.query.status as string;
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    // Préparation PDF
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "landscape",
    });
    res.setHeader("Content-Type", "application/pdf");
    const filename = `commandes_${new Date().toISOString().split("T")[0]}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Titre
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Export des commandes", { align: "center" });
    doc.moveDown(0.2);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Date d'export : ${new Date().toLocaleDateString("fr-FR")}`, {
        align: "center",
      });
    doc.moveDown(0.8);

    // Colonnes
    const headers = [
      "ID Commande",
      "Date",
      "Client",
      "Email",
      "Statut",
      "Total (€)",
      "Payé",
      "Livré",
    ];
    const colWidths = [90, 60, 100, 140, 60, 70, 40, 40]; // total: 600
    const tableStartX = 40;
    let y = doc.y;

    // En-têtes
    doc
      .rect(
        tableStartX,
        y,
        colWidths.reduce((a, b) => a + b, 0),
        20
      )
      .fill("#eeeeee");
    doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
    let x = tableStartX;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, y + 6, {
        width: colWidths[i] - 4,
        align: i === 5 ? "right" : "left",
      });
      x += colWidths[i];
    });
    doc.moveDown();
    y += 20;

    // Lignes du tableau
    doc.font("Helvetica").fontSize(9);
    let totalGlobal = 0;
    orders.forEach((order, idx) => {
      const orderObj = order.toObject() as any;
      let userName = orderObj.user?.name || "";
      let userEmail = orderObj.user?.email || "";
      const row = [
        orderObj._id
          ? orderObj._id.toString().slice(0, 8) +
            "..." +
            orderObj._id.toString().slice(-4)
          : "",
        orderObj.createdAt
          ? new Date(orderObj.createdAt).toLocaleDateString("fr-FR")
          : "",
        userName,
        userEmail,
        orderObj.orderStatus || "",
        (orderObj.totalPrice || 0).toFixed(2),
        orderObj.isPaid ? "Oui" : "Non",
        orderObj.isDelivered ? "Oui" : "Non",
      ];
      totalGlobal += Number(orderObj.totalPrice) || 0;

      // Zébrage
      if (idx % 2 === 1) {
        doc
          .rect(
            tableStartX,
            y,
            colWidths.reduce((a, b) => a + b, 0),
            16
          )
          .fill("#f7f7f7");
        doc.fillColor("#000");
      }

      // Affichage des cellules
      x = tableStartX;
      row.forEach((field, i) => {
        let value = String(field);
        if (value.length > 30) value = value.slice(0, 27) + "...";
        doc.text(value, x + 2, y + 3, {
          width: colWidths[i] - 4,
          align: i === 5 ? "right" : "left",
        });
        x += colWidths[i];
      });
      y += 16;
      doc.y = y;
    });

    // Ligne de total global
    doc.font("Helvetica-Bold").fontSize(10);
    x = tableStartX;
    for (let i = 0; i < 5; i++) {
      doc.text("", x + 2, y + 3, { width: colWidths[i] - 4 });
      x += colWidths[i];
    }
    doc.text("Total", x + 2, y + 3, {
      width: colWidths[5] - 4,
      align: "right",
    });
    x += colWidths[5];
    doc.text(totalGlobal.toFixed(2), x + 2, y + 3, {
      width: colWidths[6] + colWidths[7] - 4,
      align: "right",
    });

    // Pied de page (nombre de commandes)
    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        `Total commandes exportées : ${orders.length}`,
        tableStartX,
        undefined,
        { align: "right", width: colWidths.reduce((a, b) => a + b, 0) }
      );

    doc.end();
  }
);

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req: LoginRequest, res: Response) => {
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

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Construire le filtre
    const filter: UserFilter = {};

    // Filtrage par recherche
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search as string, $options: "i" } },
        { lastName: { $regex: req.query.search as string, $options: "i" } },
        { email: { $regex: req.query.search as string, $options: "i" } },
      ];
    }

    // Filtrage par rôle
    if (req.query.role) {
      if (req.query.role === "admin") {
        filter.isAdmin = true;
      } else if (req.query.role === "user") {
        filter.isAdmin = false;
      }
    }

    const count = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Ajouter les statistiques des commandes pour chaque utilisateur
    const usersWithStats = await Promise.all(
      users.map(async user => {
        const orderCount = await Order.countDocuments({ user: user._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: user._id, isPaid: true } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);

        return {
          ...user.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    res.json({
      users: usersWithStats,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  }
);

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(
  async (req: UpdateUserRoleRequest, res: Response) => {
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
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

    // Vérifier que l'utilisateur n'est pas l'admin actuel
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot delete your own account");
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  }
);

export {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  exportOrdersCSV,
  exportOrdersPDF,
  loginAdmin,
  getUsers,
  updateUserRole,
  deleteUser,
};
